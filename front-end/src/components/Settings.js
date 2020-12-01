// React imports
import React from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';

// CSS imports
import './Settings.css';

const PORT = (process.env.PORT || 5000)

function updateUserRecord(userData)
{
	const apiPayload = {
		userID : userData.userID,
		newInfo : {
			firstName : userData.firstname,
			lastName : userData.lastname,
			usesMetric : userData.usesMetric
		}
	}

	try
	{
		const response = fetch('http://localhost:' + PORT + '/api/updateUserInfo',
			{
				method:'POST',
				body : JSON.stringify(apiPayload),
				headers : {'Content-Type': 'application/json'}});

		return response;
	}
	catch (e)
	{
		return;
	}
}

class Settings extends React.Component
{
	constructor()
	{
		super();
		this.userData = JSON.parse(localStorage.getItem('user_data'));
	}

	componentDidUpdate()
	{
		// recieves jwt from api
		updateUserRecord(this.userData);
	}

	render()
	{
		var newData = {
			firstname : '',
			lastname : ''
		};

		this.system = (this.userData.usesMetric) ? 'Metric' : 'Imperial';

		const saveChanges = () =>
		{
			if (newData.firstname.value !== '')
			{
				this.userData.firstname = newData.firstname.value;
			}

			if (newData.lastname.value !== '')
			{
				this.userData.lastname = newData.lastname.value;
			}

			localStorage.setItem('user_data', JSON.stringify(this.userData));

			this.forceUpdate();
		}

		return (
			<div className="settings-dialog">
				<Form.Group controlId="username">
					<Form.Label>Username:</Form.Label>
					<Form.Control type="username" placeholder={this.userData.username} readOnly />
				</Form.Group>

				<Form.Group controlId="email">
					<Form.Label>Email:</Form.Label>
					<Form.Control type="email" placeholder={this.userData.email} readOnly />
				</Form.Group>

				<Form.Group controlId="firstname">
					<Form.Label>First Name:</Form.Label>
					<Form.Control type="text" placeholder={this.userData.firstname} ref={(c) => newData.firstname = c} />
				</Form.Group>

				<Form.Group controlId="lastname">
					<Form.Label>Last Name:</Form.Label>
					<Form.Control type="text" placeholder={this.userData.lastname} ref={(c) => newData.lastname = c} />
				</Form.Group>

				<Form.Group controlId="unitSystem">
					<div >
						<Form.Label>Measurement System:</Form.Label>
						<br />
						<BootstrapSwitchButton onstyle="primary" offstyle="primary" width={100} checked={this.userData.usesMetric} onlabel='Metric' offlabel='Imperial' onChange={(checked) => {this.userData.usesMetric = checked}} />
					</div>
				</Form.Group>

				<div className="submit-div">
					<Button variant="outline-primary" onClick={saveChanges}>Save Changes</Button>
				</div>
			</div>
		)
	}
}

export default Settings;
