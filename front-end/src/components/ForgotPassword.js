// React imports
import React from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

// CSS imports
import './ForgotPassword.css';

const PORT = (process.env.PORT || 5000);

async function resetPassword(request)
{
	try
	{
		const response = fetch('http://localhost:' + PORT + '/api/resetPassword',
			{
				method:'POST',
				body : JSON.stringify(request),
				headers : {'Content-Type': 'application/json'}});

		return response;
	}
	catch (e)
	{
		return '';
	}
}

class ForgotPassword extends React.Component
{
	constructor()
	{
		super();
		this.email = '';
		this.username = '';
		this.password = '';
		this.message = '';
	}

	componentDidUpdate()
	{
		var data = {
			username : this.username.value,
			email : this.email.value,
			password : this.password
		}

		resetPassword(data)
			.then(response => response.json())
			.then(json => this.setState(json.error));
	}

	render()
	{
		const submitPasswordReset = () => 
		{
			var request = {
				username : this.username.value,
				password : this.password.value,
				email : this.email.value
			}

			console.log(request);

			this.forceUpdate();
		}

		return (
			<div className="forgot-password-dialog">
				<Form>
					<div className="dialog-header-div">
						<h1 className="dialog-header">Forgot Password</h1>
					</div>

					<Form.Group controlId="username">
						<Form.Label>Username:</Form.Label>
						<Form.Control required type="text" placeholder={'Username'} ref={(c) => {this.username = c}} />
					</Form.Group>

					<Form.Group controlId="email">
						<Form.Label>Email:</Form.Label>
						<Form.Control required type="email" placeholder={'Email'} ref={(c) => {this.email = c}} />
					</Form.Group>

					<Form.Group controlId="newPassword">
						<Form.Label>New Password:</Form.Label>
						<Form.Control required type="password" placeholder={'New Password'} ref={(c) => {this.password = c}} />
					</Form.Group>

					<div className="submit-div">
						<Button type="submit" variant="outline-primary" onClick={submitPasswordReset}>Reset Password</Button>
						<br />
						<span>{this.message}</span>
					</div>
				</Form>
			</div>
		);
	}
}

export default ForgotPassword;
