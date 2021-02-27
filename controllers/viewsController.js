const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.alert = catchAsync(async (req, res, next) => {
	const { alert } = req.query;
	if (alert === 'booking')
		res.locals.alert =
			'Your booking was successfully! Please Check your email for more information. If your booking does not show up, please come back later';
	next();
});

exports.getOverview = catchAsync(async (req, res) => {
	// 1 get tour data from collection
	const tours = await Tour.find();

	// 2 build template

	// 3 render that template using tour data form 1

	// 4 url fix

	res.status(200).render('overview', {
		title: 'Studboo Tours',
		tours,
		HOST: process.env.HOST,
	});
});

exports.getMyTours = catchAsync(async (req, res, next) => {
	// Find all bookings
	const bookings = await Booking.find({ user: req.user.id });

	//  find tours with the returned id
	const tourIDs = bookings.map((el) => el.tour);
	const tours = await Tour.find({ _id: { $in: tourIDs } });

	res.status(200).render('overview', {
		title: 'My tours',
		tours,
	});
});

exports.getTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'review rating user',
	});

	if (!tour) {
		return next(new AppError('There is no tour with that name', 404));
	}
	// console.log(tour);
	res.status(200).render('tour', {
		title: `${tour.name}`,
		tour,
		HOST: process.env.HOST,
	});
});
exports.getLoginForm = catchAsync(async (req, res) => {
	res.status(200).render('login', {
		title: 'Login to your account',
	});
});

exports.getAccount = catchAsync(async (req, res) => {
	res.status(200).render('account', {
		title: 'Your account',
	});
});
exports.updateUserData = catchAsync(async (req, res) => {
	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		{
			name: req.body.name,
			email: req.body.email,
		},
		{
			new: true,
			runValidators: true,
		}
	);
	res.status(200).render('account', {
		title: 'Your account',
		user: updatedUser,
	});
});
