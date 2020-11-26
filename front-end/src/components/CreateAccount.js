// React imports
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';

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
		// integrity check username
		if (username.value === '')
		{
			setMessage('Username is required');
			return;
		}

		// integrity check password
		if (password.value === '')
		{
			setMessage('Password is required');
			return;
		}

		// integrity check confirmPassword
		if (confirmPassword.value === '')
		{
			setMessage('Please confirm your password');
			return;
		}

		// ensure both password entries match
		if (password.value !== confirmPassword.value)
		{
			setMessage('Passwords do not match');
			return;
		}

		// integrity check firstname
		if (firstname.value === '')
		{
			setMessage('Firstname required');
		}

		// integrity check email
		if (email.value === '')
		{
			setMessage('Email required');
			return;
		}
		else
		{
			// use regex to see if email is valid
			if (!/^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]+$/.test(email.value))
			{
				setMessage('Email not valid');
				return;
			}
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
					usesMetric : responseJson.usesMetric,
					favoriteRecipes : responseJson.favoriteRecipes
				};

				localStorage.setItem('user_data', JSON.stringify(userInfo));

				setMessage('Registration successful. Please check your email.');
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
		<div class = "container-fluid">
		<div className="register-dialog">
			<div className="header">
				<h1 className="dialog-headers">Create Account</h1>
			</div>
			<div className="form-div">
				<Form>
					<Form.Group>
						<Form.Label className="form-label">Username:</Form.Label>
						<Form.Control required type="text" className="register-text-input" placeholder="Username" id="username" ref={(c)=> username = c} />
					</Form.Group>

					<Form.Group>
						<Form.Label className="form-label">Email</Form.Label>
						<Form.Control required type="text" className="register-text-input" placeholder="Email"  id="email" ref={(c) => email = c} />
					</Form.Group>

					<Form.Group>
						<Form.Label className="form-label">First Name</Form.Label>
						<Form.Control required type="text" className="register-text-input" placeholder="Firstname" id="firstname" ref={(c) => firstname = c} />
					</Form.Group>

					<Form.Group>
						<Form.Label className="form-label">Last Name:</Form.Label>
						<Form.Control type="text" className="register-text-input" placeholder="Lastname" id="lastname" ref={(c) => lastname = c} />
					</Form.Group>

					<Form.Group>
						<Form.Label className="form-label">Password:</Form.Label>
						<Form.Control required type="password" className="register-text-input" placeholder="Password" id="password" ref={(c) => password = c} />
					</Form.Group>

					<Form.Group>
						<Form.Label className="form-label">Confirm Password:</Form.Label>
						<Form.Control required type="password" className="register-text-input" placeholder="Password" id="confirmPassword" ref={(c) => confirmPassword = c} />
					</Form.Group>

					<Form.Group>
						<Form.Label className="form-label">Unit System</Form.Label>
						<BootstrapSwitchButton onstyle="danger" offstyle="dark" width={100} checked={true} onlabel="Metric" offlabel="Imperial" onChange={changeMeasurementSystem} />
					</Form.Group>

					<div className="submit-div">
						<Button variant="outline-dark" onClick={doCreation}>Create Account</Button>
					</div>
				</Form>
			</div>

				<Link className = "returnLogIn" to="/">Return to Login</Link>
				<br />
				<span className="error-message">{message}</span>
		</div>
		</div>
	);
}

export default Register;

