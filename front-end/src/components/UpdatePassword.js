// React imports
import React, { useState } from 'react';
import jwt_decode from 'jwt-decode';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

// enviornment variables
const PORT = (process.env.PORT || 5000);

async function resetPassword(userID, password)
{
	// create a criteria package
	const criteria = {
		userID : userID,
		newInfo : {
			password : password
		}
	};

	try
	{
		const response = fetch('http://localhost:' + PORT + '/api/updateUserInfo',
			{
				method:'POST', 
				body : JSON.stringify(criteria),
				headers : {'Content-Type': 'application/json'}
			});

		return response;
	}
	catch(e)
	{
		console.log(e.toString());
		return;
	}
}
function UpdatePassword()
{
	const [message, setMessage] = useState('');

	const changeMessage = (newMessage) =>
	{
		setMessage(newMessage);
	}
	var password;
	var confirmPassword;

	const update = (event) =>
	{
		event.preventDefault();

		if (password === '')
		{
			changeMessage('New Password is required');
			return;
		}
		// bring the URI to local scope
		const uri = window.location;

		// using regex to extract the parameter out of the URI
		const regex = /id=[[a-zA-Z0-9]+/;
		const extracted = regex.exec(uri);

		const userID = extracted[0].slice(3);
		var extractedData = {
			password : password
		}

		resetPassword(userID, extractedData.password)
			.then(response => response.json())
			.then(json => setMessage(jwt_decode(json).error));

	}

	return(
		<div>
		<Form>
		<Form.Group controlId="password">
			<Form.Label>New Password:</Form.Label>
			<Form.Control type="password" placeholder={'Password'} ref={(c) => password = c} />
		</Form.Group>
		<Form.Group controlId="ConfirmPassword">
			<Form.Label>Confirm New Password:</Form.Label>
			<Form.Control type="password" placeholder={'Confirm Password'} ref={(c) => confirmPassword = c} />
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