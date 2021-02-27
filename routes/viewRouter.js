const express = require('express');

const authController = require(`./../controllers/authController`);
// const bookingController = require(`./../controllers/bookingController`);

const viewsController = require(`./../controllers/viewsController`);
const router = express.Router();

// Checking for alerts
router.use(viewsController.alert);

// Protected route checker
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.post(
	'/submit-user-data',
	authController.protect,
	viewsController.updateUserData
);

// all below routes are checked for logged in users

router.get(
	'/',
	// bookingController.createBookingCheckout,
	authController.isLoggedIn,
	viewsController.getOverview
);
router.get('/tours/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

// Data Updation routes

module.exports = router;
