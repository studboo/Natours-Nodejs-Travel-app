const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
	const message = `invalid error ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
	if (req.originalUrl.startsWith('/api')) {
		res.status(err.stausCode).json({
			status: err.status,
			err: err,
			message: err.message,
			stack: err.stack,
		});
	} else {
		res.status(err.stausCode).render('error', {
			title: 'Something went wrong',
			msg: err.message,
		});
	}
};
const handleValidationError = (err) => {
	const message = `Invalid input: ${err.message}`;
	return new AppError(message, 400);
};

const sendErrorProd = (err, res) => {
	// OPERATIONAL, TRUSTED ERROR: SEND MESSAGE TO CLINET
	if (err.isOperational) {
		res.status(err.stausCode).json({
			status: err.status,
			message: err.message,
		});
		// PROGRAMMING OR OTHER UNKNOWN ERROE: DON'T LEAK ERRORS DETAILS
	} else {
		// 1 Log the error
		console.error('error :D', err);

		// 2 send generic message
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong ',
		});
	}
};

module.exports = (err, req, res, next) => {
	err.stausCode = err.stausCode || 500;
	err.status = err.status || 'Something went wrong (at error contollers)';

	if (process.env.NODE_ENV === 'development') {
		if (err.code === 11000) {
			res.status(500).json({
				status: 'error',
				message: 'Something went wrong at 11000 (duplicate data)',
			});
		}
		if (err.name === 'JsonWebTokenError') {
			if (req.originalUrl.startsWith('/api')) {
				res.status(err.stausCode).json({
					status: err.status,
					message: 'JsonWebTokenError',
				});
			} else {
				res.status(err.stausCode).render('error', {
					title: 'Please login to access',
					msg: 'Just to be safe login agin to access this page',
				});
			}
		}
		if (err.name === 'TokenExpiredError') {
			res.status(500).json({
				status: 'Login Expired',
				message: 'Login Expired, Please login again.',
			});
		}
		let error = { ...err };
		if (error.name === 'ValidatorError') error = handleValidationError(error);
		else {
			sendErrorDev(err, req, res);
		}
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
		sendErrorProd(error, res);
	} else {
		process.exit();
	}
};
