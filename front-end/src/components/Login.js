// React imports
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

// CSS imports
import './Login.css';

// JWT includes
import jwt_decode from 'jwt-decode';

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

			// decode the response jwt
			responseJson = jwt_decode(responseJson);

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
				<h1 className="dialog-header">Login</h1>

				<Form>
					<Form.Group controlId="loginName">
						<Form.Label></Form.Label>
						<Form.Control type="text" placeholder="Username" ref={(c) => username = c}/>
					</Form.Group>

					<Form.Group controlId="loginPassword">
						<Form.Label></Form.Label>
						<Form.Control type="password" placeholder="Password"  ref={(c) => password = c}/>
					</Form.Group>

					<Link id="forgotPasswordLink" to="/resetPassword">Forgot Password</Link>
					<br />
					<Button variant="primary" type="submit" onClick={doLogin}>Login</Button>
				</Form>
				<br />
				<Link id="registerLink" to="/register">Don't have an account? Sign Up</Link>
				<br />
				<span id="loginResult" className="error-message">{message}</span>
		</div>
	);
}

export default Login;
