// React imports
import React, { useState } from 'react';

// CSS imports
import './CreateAccount.css'

// Misc. imports
// const passwordHash = require('password-hash');

// environment variables
const PORT = (process.env.PORT || 5000);

function Register()
{
	var username = '';
	var password = '';
	var firstname = '';
	var lastname = '';
	var email = '';
	var confirmPassword = '';

	const [message, setMessage] = useState('');
	const [metric, setMetric] = useState(true);


	const doCreation = async event =>
	{
		// ensure both password entries match
		if (password.value !== confirmPassword.value)
		{
			setMessage('Passwords do not match');
			return;
		}

		event.preventDefault();

		var apiPayload = {
			username : username.value,
			password : password.value,
			email : email.value,
			firstname : firstname.value,
			lastname : lastname.value,
			usesMetric : metric
		}

		// Call the register endpont and process data
		try
		{
			const response = await fetch('http://localhost:' + PORT + '/api/registerUser',
				{
					method : 'POST',
					body : JSON.stringify(apiPayload),
					headers : {'Content-Type': 'application/json'}}); 

			var responseJson = await JSON.parse(await response.text());

			console.log(responseJson);

			// Check if register failed
			if (responseJson.success === false)
			{
				setMessage(responseJson.error);
			}
			else
			{
				var userInfo = {
					userID : responseJson._id,
					email : responseJson.email,
					firstname : responseJson.firstname,
					lastname : responseJson.lastname,
					// usesMetric : responseJson.usesMetric,
					favoriteRecipes : responseJson.favoriteRecipes
				};

				localStorage.setItem('user_data', JSON.stringify(userInfo));

				setMessage('Registration Complete');
				window.location.href = '/recipes';
			}
		}
		catch (e)
		{
			alert(e.toString());
			return;
		}
	}

	const changeMeasurementSystem = () =>
	{
		setMetric(!metric);
	}

	return (
		<div id="registerDiv">
			<h1 className="dialog-header">Create Account</h1>
			<form className="register-form">
				<input className="form-input" type="text" id="username" placeholder="Username"   ref={(c) => username = c} />
				<br />
				<input className="form-input" type="text" id="firstname" placeholder="Firstname"  ref={(c) => firstname = c}/>
				<br />
				<input className="form-input" type="text" id="lastname" placeholder="Lastname"  ref={(c) => lastname = c}/>
				<br />
				<input className="form-input" type="text" id="email" placeholder="Email"  ref={(c) => email = c}/>
				<br />
				<input className="form-input" type="password" id="password" placeholder="Password"   ref={(c) => password = c} />
				<br />
				<input className="form-input" type="password" id="password" placeholder="Confirm Password"   ref={(c) => confirmPassword = c} />
				<br />
				<div className="measurementSwitch">
					<label className="form-label">Metric</label>
					<label className="switch">
						<input type="checkbox" onClick={ changeMeasurementSystem } />
						<span className="slider round" />
					</label>
					<label className="form-label">Imperial</label>
				</div>
				<br />
				<label className="error-message">{message}</label>
				<div className="registerButton">
						<input className="buttons" type="submit" id="loginButton" value="Create Account" onClick={ doCreation } />
				</div>
			</form>
		</div>
	);
}

export default Register;
