// React imports
import React, { useState } from 'react';

// CSS imports
import './CreateAccount.css'

// Misc. imports
const passwordHash = require('password-hash');

// environment variables
const PORT = (process.env.PORT || 5000);

function Register()
{
	var username, password, firstname, lastname, email, confirmPassword;

	const INVALID_USER = -1;

	const [message, setMessage] = useState('');

	const doCreation = async event =>
	{
		// ensure both password entries match
		if (password != confirmPassword)
		{
			setMessage('Passwords do not match');
			return;
		}

		event.preventDefault();

		var apiPayload = {
			username : username,
			password : passwordHash.generate(password),
			email : email,
			firstname : firstname,
			lastname : lastname
		}

		// Call the register endpont and process data
		try
		{
			const response = await fetch('http://localhost:' + PORT + '/api/registerUser',
				{
					method : 'POST',
					body : JSON.stringify(apiPayload),
					headers : {'Content-Type': 'application/json'}}); 

			var responseJson = JSON.parse(await response.text());

			// Check if register failed
			if (responseJson.userID == INVALID_USER)
			{
				setMessage(responseJson.error);
			}
			else
			{
				setMessage('Registration Complete');
				window.location.href = '/';
			}
		}
		catch (e)
		{
			alert(e.toString());
			return;
		}
	}

	return (
		<div id="registerDiv">

				<form className="register-form" onSubmit={ doCreation }>
						<input className="form-input" type="text" id="username" placeholder="Username"   ref={(c) => username = c} />
						<input className="form-input" type="text" id="email" placeholder="Email"  ref={(c) => email = c}/>
						<input className="form-input" type="password" id="password" placeholder="Password"   ref={(c) => password = c} />
						<input className="form-input" type="password" id="password" placeholder="Confirm Password"   ref={(c) => confirmPassword = c} />
						<div className="registerButton">
								<input className="buttons" type="submit" id="loginButton" class="buttons" value="Create Account" onClick={doCreation} />       
						</div>
				</form>
		</div>
	);
}

export default Register;
