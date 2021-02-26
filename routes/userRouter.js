const express = require('express');

const usercontroller = require(`./../controllers/userController`);
const authcontroller = require(`./../controllers/authController`);

const router = express.Router();

router.post('/signup', authcontroller.signup);
router.post('/login', authcontroller.login);
router.get('/logout', authcontroller.logout);

router.post('/forgotpassword', authcontroller.forgotPassword);
router.patch('/resetpassword/:token', authcontroller.resetPassword);

// Protecc all routes below here
router.use(authcontroller.protect);

router.patch('/updateMyPassword', authcontroller.updatePassword);

router.get('/me', usercontroller.getMe, usercontroller.getUser);

router.patch(
	'/updateMe',
	usercontroller.uploadUserPhoto,
	usercontroller.resizeUserPhoto,
	usercontroller.updateMe
);
router.delete('/deleteMe', usercontroller.deleteMe);

router.use(authcontroller.restrictTo('admin'));

router
	.route('/')
	.get(usercontroller.getAllUsers)
	.post(usercontroller.createUser);
router
	.route('/:id')
	.get(usercontroller.getUser)
	.patch(usercontroller.updateUser)
	.delete(usercontroller.deleteUser);

module.exports = router;
