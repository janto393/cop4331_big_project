// React imports
import React from 'react';
import jwt_decode from 'jwt-decode';

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
		const response = fetch('http://localhost:' + PORT + '/api/resetPassword',
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
class UpdatePassword extends React.Component
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
        var password;
		console.log(userID);

		// TODO: fetch API (look at view Recipe for guidance)
		resetPassword(userID)
			.then(response => response.json())
			.then(json => this.setState({newinfo : jwt_decode(json)}));
    }
    
    render(){
        return (
            <div>
                <Form.Group controlId="username">
					<Form.Label>Password:</Form.Label>
					<Form.Control type="username" placeholder={this.userData.username}  />
				</Form.Group>
            </div>
        );
    }
}
export default UpdatePassword;