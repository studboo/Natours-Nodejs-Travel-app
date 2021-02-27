/* eslint-disable */
document.getElementById('updatesettings').addEventListener('click', function (event) {
	event.preventDefault();
});
const updateSettings = async (id) => {
	// console.log(name, email, id);

	try {
		// user password update
		if (id === 'password') {
			document.getElementById('updatepassword').textContent = 'Updating...';
			const passwordold = document.getElementById('password-current').value;
			const password = document.getElementById('password').value;
			const passwordConfirm = document.getElementById('password-confirm').value;
			const res = await axios({
				method: 'PATCH',
				url: '/api/v1/users/updatemypassword',
				data: {
					oldPassword: passwordold,
					password: password,
					passwordConfirm: passwordConfirm,
				},
			});
			// console.log(res);
			if (res.data.status === 'success') {
				showAlert('success', 'successfully updated');
				document.getElementById('updatepassword').textContent = 'SAVE PASSWORD';
				document.getElementById('password-current').value = '';
				document.getElementById('password').value = '';
				document.getElementById('password-confirm').value = '';
			}
		}
		// username and email update
		else {
			// const email = document.getElementById('email').value;
			// const name = document.getElementById('name').value;
			// const photo = document.getElementById('photo').files[0];
			// var formData = new FormData();
			const form = new FormData();
			form.append('name', document.getElementById('name').value);
			form.append('email', document.getElementById('email').value);
			form.append('photo', document.getElementById('photo').files[0]);
			const res = await axios({
				method: 'PATCH',
				url: '/api/v1/users/updateMe',
				data: form,
			});
			// console.log(res.status, photo);
			if (res.status === 200) {
				showAlert('success', 'successfully updated');
			}
		}
	} catch (err) {
		showAlert('error', 'Something went wrong');
	}
};

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage);
