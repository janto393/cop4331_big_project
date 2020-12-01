// React imports
import React from 'react';
import jwt_decode from 'jwt-decode';

// CSS imports
import './VerifyDialog.css';

import buildPath from '../scripts/buildPath';

// Server static assets if in production
var BUILD_PATH;
if (process.env.NODE_ENV === 'production') 
{
	BUILD_PATH = 'https://brownie-points-4331-6.herokuapp.com';
}
else
{
	BUILD_PATH = 'http://localhost:3000';
}

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
		const response = fetch(buildPath('updateUserInfo'),
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
			<div className="emailVerification-fluid">
				<div className="verifiedMessage">
					<h1 className="text">Your email has been verified!</h1>
					<br />
					<p className="text">Please press the link to continue to the login page and start making your mouthwatering recipes.</p>
					<a className="text" href={BUILD_PATH}>
						Go to Login
					</a>
				</div>
			</div>
		);
	}
}

export default VerifyDialog;
