// React imports
import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import jwt_decode from 'jwt-decode';

// CSS imports
import './VerifyDialog.css';
import { response } from 'express';

// enviornment variables
const PORT = (process.env.PORT || 5000);
async function isVerified(userID)
{
	// create a criteria package
	const criteria = {
		userID : userID,
		newInfo : {
			isVerified : true
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

class VerifyDialog extends React.Component
{
	constructor()
	{
		super();

		// container for any message needing to be displayed in the component
		this.message = '';
	}

	componentDidMount()
	{
		// bring the URI to local scope
		const uri = window.location;

		// using regex to extract the parameter out of the URI
		const regex = /id=[[a-zA-Z0-9]+/;
		const extracted = regex.exec(uri);

		const userID = extracted[0].slice(3);
		console.log(userID);

		// TODO: fetch API (look at view Recipe for guidance)
		isVerified(userID)
			.then(response => response.json())
			.then(json => this.setState({newinfo : jwt_decode(json)}));
		// console.log(this.state);
	}

	render()
	{
		return (
			<div>

				<Link to="/">Go to Login</Link>
			</div>
		);
	}
}

export default VerifyDialog;
