const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxlength: [40, 'A tour must have less than 40 characters'],
			minlength: [10, 'A tour must have more than 10 characters'],
			// validate: [validator.isAlpha, 'Tour name must only contain alpha characters'],
		},
		slug: {
			type: String,
		},
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a Group Size'],
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either: easy, medium or difficult',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1 '],
			max: [5, 'Rating must be below 5'],
			set: (value) => Math.round(value * 10) / 10,
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price'],
		},
		discount: {
			type: Number,
			validate: {
				validator: function (val) {
					// this only points to current doc on NEW DOCUMENT CREATION
					return val < this.price;
				},
				message: 'The tour must have a discount less than price',
			},
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a description'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a image cover'],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false,
		},
		startLocation: {
			// GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number],
			address: String,
			description: String,
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// tourSchema.index({ price: 1 });

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('dutrationWeeks').get(function () {
	return this.duration / 7;
});
// This is virtual populate
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } });
	this.start = Date.now();
	next();
});

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt',
	});
	next();
});

tourSchema.post(/^find/, function (docs, next) {
	// console.log(docs);
	console.log(`Query took ${Date.now() - this.start} milliseconds!`);
	next();
});

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
// 	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
// 	// console.log(this.pipeline());
// 	next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
