const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// nam email photo , password, password confirmation

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please tell us your name'],
		unique: true,
		maxlength: [40, 'A user must have less than 40 characters'],
		minlength: [5, 'A user must have more than 5 characters'],
		// validate: [validator.isAlpha, 'user name must only contain alpha characters'],
	},
	email: {
		type: String,
		required: [true, 'Please enter a valid email address'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Hey, baka, please enter a valid email address'],
	},
	photo: {
		type: String,
		default: 'default.jpg',
	},
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'Please Provide a valid password'],
		maxlength: [64, 'A user must have less than 64 characters'],
		minlength: [8, 'A user must have more than 8 characters'],
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Passwords do not match'],
		validate: {
			// This only works on SAVE!!
			validator: function (el) {
				return el === this.password;
			},
			message: 'Passwords do not match',
		},
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: 'boolean',
		default: true,
		select: false,
	},
});

// ALL MIDDLEWARE HERE
userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });
	next();
});

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	//else
	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassowordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

		return JWTTimestamp < changedTimestamp;
	}
	// FALSE MEANS NOT CHANGED TIMESTAMP
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	// console.log({ resetToken }, this.passwordResetToken);

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
