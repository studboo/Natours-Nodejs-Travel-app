const mongoose = require('mongoose');
const fs = require('fs');

const dotenv = require(`dotenv`);
dotenv.config({ path: '../../config.env' });
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
// console.log(process.env);

//------------------------ DATABASE: --------------------------------
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(() => console.log('DB connection established'));

//---------------------------------------

const tours = JSON.parse(fs.readFileSync(`tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`users.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`reviews.json`, 'utf8'));

//--Import
const importData = async () => {
	try {
		await Tour.create(tours);
		await User.create(users, { validateBeforeSave: false });
		await Review.create(reviews);
		console.log('Data Import sucess');
		process.exit();
	} catch (err) {
		console.log(err);
		process.exit();
	}
};

//Delete all data
const deleteData = async () => {
	try {
		await Tour.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();
		console.log('data deleted');
		process.exit();
	} catch (error) {
		console.log(error);
		process.exit();
	}
};

if (process.argv[2] === '--import') {
	importData();
}
if (process.argv[2] === '--delete') {
	deleteData();
}

console.log(process.argv);
