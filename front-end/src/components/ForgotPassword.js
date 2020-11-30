// React imports
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

// CSS imports
import './ForgotPassword.css';

// jwt imports
import jwt_decode from 'jwt-decode';

function resetPassword(request)
{
	try
	{
		return fetch('https://brownie-points-4331-6.herokuapp.com:' + process.env.PORT + '/api/resetPassword',
			{
				method:'POST',
				body : JSON.stringify(request),
				headers : {'Content-Type': 'application/json'}
			});
	}
	catch (e)
	{
		return 'Could not call API';
	}
}

function ForgotPassword()
{
	const [message, setMessage] = useState('');

	const changeMessage = (newMessage) =>
	{
		setMessage(newMessage);
	}

	var data = {
		email : '',
		username : '',
		password : ''
	}

	const doReset = (event) =>
	{
		event.preventDefault();

		if (data.username.value === '')
		{
			changeMessage('Username is required');
			return;
		}

		if (data.email.value === '')
		{
			changeMessage('Email is required');
			return;
		}
		else
		{
			// use regex to see if email is valid
			if (!/^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]+$/.test(data.email.value))
			{
				setMessage('Email not valid');
				return;
			}
		}

		if (data.password.value === '')
		{
			changeMessage('Password is required');
			return;
		}

		var extractedData = {
			username : data.username.value,
			email : data.email.value,
			password : data.password.value
		}

		// call the api through it's gateway function
		resetPassword(extractedData)
			.then(response => response.json())
			.then(json => setMessage(jwt_decode(json).error));
	}

	return (
		<div className="forgotpwpage-fluid">
		<div className="forgot-password-dialog">
			<Form>
				<div className="dialog-header-div">
					<h1 className="dialog-header">Forgot Password</h1>
				</div>

				<Form.Group controlId="username">
					<Form.Label>Username:</Form.Label>
					<Form.Control required type="text" placeholder={'Username'} ref={(c) => {data.username = c}} />
				</Form.Group>

				<Form.Group controlId="email">
					<Form.Label>Email:</Form.Label>
					<Form.Control required type="text" placeholder={'Email'} ref={(c) => {data.email = c}} />
				</Form.Group>

				<Form.Group controlId="newPassword">
					<Form.Label>New Password:</Form.Label>
					<Form.Control required type="password" placeholder={'New Password'} ref={(c) => {data.password = c}} />
				</Form.Group>

				<div className="submit-div">
					<Button variant="dark" onClick={doReset}>Reset Password</Button>
				</div>
			</Form>
			<div className="message-div">
				<span>{message}</span>
			</div>
			<div className="link-div">
				<Link to="/">Return to Login</Link>
			</div>
		</div>
		</div>
	);
}

export default ForgotPassword;
