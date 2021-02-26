const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) return next(new AppError('Nothing to delete', 404));

		res.status(204).json({
			status: 'sucess',
			message: `${doc} has been deleted sucessfully`,
			data: null,
		});
	});

exports.updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) return next(new AppError('No Document found with id', 404));

		res.status(200).json({
			status: 'sucess',
			data: {
				data: doc,
			},
		});
	});

exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);
		res.status(201).json({
			status: 'sucess',

			data: {
				data: doc,
			},
		});
	});

exports.getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let doc;
		if (popOptions) doc = await Model.findById(req.params.id).populate(popOptions);
		if (!popOptions) doc = await Model.findById(req.params.id);

		// query = await query.populate('reviews');
		// const doc = await query;
		// console.log(popOptions);

		if (!doc) next(new AppError('no document found with that ID', 404));

		res.status(200).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	});

exports.getAll = (Model) =>
	catchAsync(async (req, res, next) => {
		let filter = {};
		if (req.params.tourId) filter = { tour: req.params.tourId };

		const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
		const tours = await features.query;

		// SEND RESPONSE
		res.status(200).json({
			status: 'sucess',
			results: tours.length,
			data: {
				data: tours,
			},
		});
	});
