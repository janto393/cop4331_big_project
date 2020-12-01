// React imports
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import jwt_decode from 'jwt-decode';
import buildPath from '../scripts/buildPath';

// enviornment variables
const PORT = (process.env.PORT || 5000);

async function ResetPassword(data)
{
	const criteria = {
		userID : data.userID,
		newInfo : {
			password : data.password.value
		}
	};

	try
	{
		return fetch(buildPath('updatePassword'),
			{
				method:'POST', 
				body : JSON.stringify(criteria),
				headers : {'Content-Type': 'application/json'}
			});
	}
	catch(e)
	{
		return 'Could not call API';
	}
}
function UpdatePassword()
{
	const [message, setMessage] = useState('');

	const changeMessage = (newMessage) =>
	{
		setMessage(newMessage);
	}
	var incoming = {
		password:'',
		confirmPassword:''
	}

	const update = (event) =>
	{
		event.preventDefault();

		if (incoming.password === '')
		{
			changeMessage('New Password is required');
			return;
		}
		if (incoming.password.value !== incoming.confirmPassword.value)
		{
			changeMessage('Passwords do not match.');
			return;
		}
		// bring the URI to local scope
		const uri = window.location;

		// using regex to extract the parameter out of the URI
		const regex = /id=[[a-zA-Z0-9]+/;
		const extracted = regex.exec(uri);

		const userID = extracted[0].slice(3);
		const data = {
			userID : userID,
			password : incoming.password,
		};

		ResetPassword(data)
			.then(response => response.json())
			.then(json => setMessage(jwt_decode(json).error));

	}

	return(
		<div>
		<Form>
		<Form.Group controlId="password">
			<Form.Label>New Password:</Form.Label>
			<Form.Control type="password" placeholder={'Password'} ref={(c) => incoming.password = c} />
		</Form.Group>
		<Form.Group controlId="ConfirmPassword">
			<Form.Label>Confirm New Password:</Form.Label>
			<Form.Control type="password" placeholder={'Confirm Password'} ref={(c) => incoming.confirmPassword = c} />
		</Form.Group>
		<div className="submit-div">
			<Button variant="outline-primary" onClick={update}>Submit</Button>
		</div>
		</Form>
		<div className="message-div">
				<span>{message}</span>
			</div>
		<div className="link-div">
			<Link to="/">Return to Login</Link>
		</div>
	</div>
	);

    
}
export default UpdatePassword;