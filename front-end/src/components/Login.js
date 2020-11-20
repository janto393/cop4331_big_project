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

	const INVALID_USER = -1;

	const doLogin = async event =>
	{
		// cancels the event if it is cancelable
		event.preventDefault();

		var apiPayload = {
			username : username.value,
			password : password.value
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
            console.log(responseJson);

            if(!responseJson.success)
            {
                setMessage(responseJson.error);
            }
			// Check if the user has not been validated yet
			// else if (!responseJson.isVerified)
			// {
			// 	setMessage('Please verify email before logging in');
			// }

			// Store the user information in local storage
			else
			{

				var userInfo = {
					userID : responseJson._id,
					email : responseJson.email,
					firstname : responseJson.firstname,
					lastname : responseJson.lastname,
					usesMetric : responseJson.usesMetric,
					favoriteRecipes : responseJson.favoriteRecipes
				};

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
