// React imports
import React from 'react';
import jwt_decode from 'jwt-decode';

// CSS imports
import './VerifyDialog.css';

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
		const response = fetch('https://brownie-points-4331-6.herokuapp.com/api/updateUserInfo',
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
				<div style={{margin:"0 auto",backgroundColor:"#e699ff",width:"770",height:"120px",border:"1px solid #000"}}>
					<h1 style={{color:"rgb(0, 0, 0)",fontSize: "50px"}}>Your email has been verified!!</h1>
				</div>
				<div style={{margin:"0 auto",backgroundColor:"#00ffff",width:"770px", height:"300px", border:"1px solid #000"}}>
					<br />
					<p style={{fontSize: "25px"}}>Press the link to continue to the login page to start making your mouthwatering recipes.</p>
					<a style={{fontSize: "25px"}} href="http://localhost:3000">
						Go to Login
					</a>
				</div>
			</div>
		);
	}
}

export default VerifyDialog;
