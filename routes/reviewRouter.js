const express = require('express');

const reviewcontroller = require(`./../controllers/reviewController`);
const authcontroller = require(`./../controllers/authController`);

const router = express.Router({
	mergeParams: true,
});

router.use(authcontroller.protect);

router
	.route('/')
	.get(reviewcontroller.getAllReviews)
	.post(
		authcontroller.restrictTo('user'),
		reviewcontroller.setTourUserIds,
		reviewcontroller.createReview
	);

router
	.route('/:id')
	.get(reviewcontroller.getReview)
	.patch(
		authcontroller.restrictTo('user', 'admin'),
		reviewcontroller.updateReview
	)
	.delete(
		authcontroller.restrictTo('user', 'admin'),
		reviewcontroller.deleteReview
	);

module.exports = router;
