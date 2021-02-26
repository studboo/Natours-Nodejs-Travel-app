const express = require('express');

const authcontroller = require(`./../controllers/authController`);
const tourController = require(`./../controllers/tourcontroller`);
const reviewRouter = require(`./reviewRouter`);

const router = express.Router();

// router
// 	.route('/:tourId/reviews')
// 	.post(
// 		authcontroller.protect,
// 		authcontroller.restrictTo('user'),
// 		reviewcontroller.createReview
// 	);

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(tourController.getTourStats);
router
	.route('/monthly-plan/:year')
	.get(
		authcontroller.protect,
		authcontroller.restrictTo('admin', 'lead-guide', 'guide'),
		tourController.getMonthlyPlan
	);
router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours);

router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authcontroller.protect,
		authcontroller.restrictTo('admin', 'lead-guide'),
		tourController.createTour
	);
router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authcontroller.protect,
		authcontroller.restrictTo('admin', 'lead-guide'),
		tourController.uploadTourImages,
		tourController.resizeTourImages,
		tourController.updateTour
	)
	.delete(
		authcontroller.protect,
		authcontroller.restrictTo('admin', 'lead-guide'),
		tourController.deleteTour
	);

module.exports = router;
