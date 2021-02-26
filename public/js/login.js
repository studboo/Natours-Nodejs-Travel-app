/* eslint-disable */

const hideAlert = () => {
	const el = document.querySelector('.alert');
	if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg) => {
	hideAlert();
	const markup = `<div class="alert alert--${type}">${msg}</div>`;
	document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
	window.setTimeout(hideAlert, 5000);
};

const login = async () => {
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	try {
		const res = await axios({
			method: 'POST',
			url: 'http://127.0.0.1:3000/api/v1/users/login',
			data: {
				email,
				password,
			},
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Login successful');
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}

		console.log(res);
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};

const logout = async () => {
	try {
		const res = await axios({
			method: 'GET',
			url: 'http://127.0.0.1:3000/api/v1/users/logout',
		});
		location.reload(true);
	} catch (err) {
		showAlert('error', 'Error');
	}
};

const stripe = Stripe('pk_test_51IOhQWB9Y1v2rL4usTkxjmbD6w4oDwB0B9YkqjDpwRSYj2Y23FQRc2tdazHI3nk4RqOUNpv8OwR7aSS1Siw06gK800lIzD6FG0');

const bookTour = async (tourId) => {
	try {
		// 1 get the session from the server
		const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);

		console.log(session);

		// 2 Create checkout form + charge credit card
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id,
		});
	} catch (err) {
		console.log(err);
		showAlert('error', 'Something went wrong');
	}
};

document.getElementById('updatesettings').addEventListener('click', function (event) {
	event.preventDefault();
});
document.getElementById('updatepassword').addEventListener('click', function (event) {
	event.preventDefault();
});
document.getElementById('bookTour').addEventListener('click', function (event) {
	event.preventDefault();
});
