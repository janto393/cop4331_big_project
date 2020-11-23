// React imports
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// CSS imports
import './Login.css';

// enviornment variables
const PORT = (process.env.PORT || 5000);

function Login()
{
	var username, password;

	const [message, setMessage] = useState('');

	const doLogin = async event =>
	{
		// cancels the event if it is cancelable
		event.preventDefault();

		var apiPayload = {
			username : username.value,
			password : password.value
		}

		// integrity check input data
		if (apiPayload.username === '')
		{
			setMessage('Username is required');
			return;
		}
		else if (apiPayload.password === '')
		{
			setMessage('Password is required');
			return;
		}

		// try to do the login
		try
		{
			const response = await fetch('http://localhost:' + PORT + '/api/login',
				{
					method:'POST',
					body : JSON.stringify(apiPayload),
					headers : {'Content-Type': 'application/json'}});

			var responseJson = await JSON.parse(await response.text());

			if(!responseJson.success)
			{
				setMessage(responseJson.error);
				return;
			}

			// Store the user information in local storage
			else
			{
				var userInfo = {
					userID : responseJson.userID,
					username : responseJson.username,
					email : responseJson.email,
					firstname : responseJson.firstname,
					lastname : responseJson.lastname,
					usesMetric : responseJson.usesMetric,
					favoriteRecipes : responseJson.favoriteRecipes
				}

				localStorage.setItem('user_data', JSON.stringify(userInfo));

				setMessage('');
				window.location.href = '/recipes';
			}
		}
		catch (e)
		{
			alert(e.toString());
			return;
		}
	}

	return (  
		<div className="login-dialog">
			<form className="login-form">
				<h1 className="dialog-header">Login</h1>
				<input className="login-text-input" type="text" id="loginName" placeholder="Username"   ref={(c) => username = c} />
				<input className="login-text-input" type="password" id="loginPassword" placeholder="Password"   ref={(c) => password = c} />
				<div>
					<span className="fpwrd-text" >Forgot Password?</span>
				</div>
				<div>
					<input className="login-button" type="submit" value="Login" onClick={doLogin} />       
				</div>
			</form>
			<div>
			<Link to="/register">
				{"Don't have an account? Sign Up"}
			</Link>
			<br />
			<span id="loginResult" className="error-message">{message}</span>
			</div>
		</div>
	);
}

export default Login;
