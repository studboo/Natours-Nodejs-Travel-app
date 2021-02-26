const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require(`../models/userModel`);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
	const token = jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
	return token;
};

const createSendToken = (user, statuscode, res) => {
	const token = signToken(user._id);

	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

	// remove password before sending response
	user.password = undefined;

	res.cookie('jwt', token, cookieOptions);
	// console.log(token);
	res.status(statuscode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const NewUser = await User.create(req.body);

	const url = `${req.protocol}://${req.get('host')}/me`;

	await new Email(NewUser, url).sendWelcome();

	createSendToken(NewUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1 CHECK EMAIL AND PASSOWRD EXIST
	if (!email || !password) {
		return next(new AppError('Please provide email and password', 400));
	}

	const user = await User.findOne({ email }).select('+password');
	// console.log(user);
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect password or email', 401));
	}

	//  CHECK IF THE USER EXITS AND PASSWORD IS CORRECT
	// IF EVETHING IS OKAY SEND TOKEN TO CLINET
	// const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
	// 	expiresIn: process.env.JWT_EXPIRES_IN,
	// });
	createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
	res.cookie('jwt', 'logout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
	let token;
	// 1 GETTING THE TOKEN AND CHECK IF IT IS THERE
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}
	// console.log(token);
	if (!token) {
		return next(new AppError('You are not logged in!', 401));
	}

	// 2 VERIFICATION THE TOKEN
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3 CHECK USER STILL EXIST
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(new AppError('The user no longer exists', 401));
	}

	// 4 CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED
	if (currentUser.changedPassowordAfter(decoded.iat)) {
		return next(new AppError('User recently changed the password! please login again', 401));
	}
	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	res.locals.user = currentUser;
	next();
});

// Only for rendered pages and no errors
exports.isLoggedIn = async (req, res, next) => {
	try {
		if (req.cookies.jwt) {
			// 1 VERIFICATION THE TOKEN
			const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
			// console.log('step 1');

			// 2 CHECK USER STILL EXIST
			const currentUser = await User.findById(decoded.id);
			// console.log('step 2');
			if (!currentUser) {
				return next();
			}

			// 3 CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED
			if (currentUser.changedPassowordAfter(decoded.iat)) {
				// console.log('step 3');
				return next();
			}
			// 4 There is a logged in user
			res.locals.user = currentUser;
			// console.log('step 4');
			return next();
		}
		next();
	} catch (err) {
		return next();
	}
};

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		// roles [admin, lead-guide]
		if (!roles.includes(req.user.role)) {
			return next(new AppError('you are not allowed to do this.', 403));
		}
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1 GET USER BASED ON POSTED EMAIL ADDRESS
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new AppError('There is no user with email address', 404));
	}

	// 2 GENERATE THE RANDOM REST TOKEN
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	try {
		// 3 SEND IT TO THE USER EMAIL
		const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
		await new Email(user, resetURL).sendPasswordReset();
		res.status(200).json({
			status: 'success',
			message: 'Please reset your password at your email address',
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new AppError('There was an error in sending the reset password', 500));
	}
});
exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1 Get user based on TOKEN
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

	// console.log(req.params.token);

	const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

	// 2 if token has not expired. and there is user, set the new passowrd
	if (!user) {
		return next(new AppError('Token has not expired', 400));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	// 3 Update changedPassowordAt proterty of user

	// 4 log the user in, send JWT
	createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1 Get user from the collection
	const user = await User.findOne(req.user._id).select('+password');
	// console.log(user);

	// 2 check if the POSTed password is correct
	if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
		return next(new AppError('Incorrect oldPassword', 401));
	}

	// 3 If the password is correct, update the password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

	// 4 log the user in, send JWT
	createSendToken(user, 200, res);
});
