// React imports
import React, { useState } from 'react';

// CSS imports
import './Login.css';

// enviornment variables
const PORT = (process.env.PORT || 5000);

function Login()
{
	var username, password;

	const [message, setMessage] = useState('');

	const INVALID_USER = -1;

	const doLogin = async event =>
	{
		// cancels the event if it is cancelable
		event.preventDefault();

		var apiPayload = {
			username : username,
			password : password
		}

		// try to do the login
		try
		{
			const response = await fetch('http://localhost:' + PORT + '/api/login',
				{
					method:'POST',
					body : JSON.stringify(apiPayload),
					headers : {'Content-Type': 'application/json'}}); 

			alert('login success');

			var responseJson = JSON.parse(await response.text());

			// Check if credentials sent were invalid
			if (responseJson.userID == INVALID_USER)
			{
				setMessage('Username/Password combination invalid');
			}

			// Check if the user has not been validated yet
			else if (!responseJson.isVerified)
			{
				setMessage('Please verify email before logging in');
			}

			// Store the user information in local storage
			else
			{
				var userInfo = {
					userID : responseJson.userID,
					email : responseJson.email,
					firstname : responseJson.firstname,
					lastname : responseJson.lastname,
					// usesMetric : responseJson.usesMetric,
					favoriteRecipes : responseJson.favoriteRecipes
				}

				localStorage.setItem('user_data', userInfo);
				setMessage('');
				window.location.href = '/myRecipes';
			}
		}
		catch (e)
		{
			alert(e.toString());
			return;
		}
	}

	return (    
		<div>
				<form className="login-form" onSubmit={doLogin}>
						<input className="form-input" type="text" id="loginName" placeholder="Username"   ref={(c) => username = c} />
						<input className="form-input" type="password" id="loginPassword" placeholder="Password"   ref={(c) => password = c} />
						<span className="fpwrd-text" >Forgot Password?</span>
						<div className="loginButton">
								<input type="submit" className="buttons" value="Login" onClick={doLogin} />       
						</div>
				</form>
		</div>
	);
}

export default Login;
