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

			var responseJson = JSON.parse(await response.text());
			// console.log(responseJson);

			if(!responseJson.success)
			{
				setMessage(responseJson.error);
				return;
			}

			// Store the user information in local storage
			else
			{
				var userInfo = {
					userID : responseJson._id,
					email : responseJson.email,
					firstname : responseJson.firstName,
					lastname : responseJson.lastName,
					usesMetric : responseJson.usesMetric,
					favoriteRecipes : responseJson.favoriteRecipes
				};

				localStorage.setItem('user_data', JSON.stringify(userInfo));
				setMessage('Login Successful');
				// window.location.href = '/recipes';
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
			<form className="login-form">
				<h1 className="dialog-header">Login</h1>
				<input className="form-input" type="text" id="loginName" placeholder="Username"   ref={(c) => username = c} />
				<br />
				<input className="form-input" type="password" id="loginPassword" placeholder="Password"   ref={(c) => password = c} />
				<br />
				<span className="fpwrd-text" >Forgot Password?</span>
				<br />
				<div className="loginButton">
						<input type="submit" className="buttons" value="Login" onClick={doLogin} />       
				</div>
			</form>
            <Link to="/register">
                  {"Don't have an account? Sign Up"}
                </Link>
            <span id="loginResult">{message}</span>
		</div>
	);
}

export default Login;
