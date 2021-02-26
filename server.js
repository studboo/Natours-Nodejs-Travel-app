const mongoose = require('mongoose');

const dotenv = require(`dotenv`);
dotenv.config({ path: './config.env' });

const app = require('./app');
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

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	console.log(`App listening on ${port}`);
});

process.on('unhandledRejection', (err) => {
	console.log(err.name, err.message, `|| UNHANDLED REJECTION ||`);
	server.close(() => {
		process.exit(1);
	});
});
process.on('uncaughtException', (err) => {
	console.log(err.name, err.message, `|| UNCAUGHTEXCEPTION ||`);
	server.close(() => {
		process.exit(1);
	});
});
