// React imports
import React from 'react';
import jwt_decode from 'jwt-decode';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

// enviornment variables
const PORT = (process.env.PORT || 5000);
async function deleteRecipe(recipeID)
{
    // create a criteria package
	const criteria = {
        recipeID : recipeID
    };

    try
	{
		const response = fetch('http://localhost:' + PORT + '/api/deleteRecipe',
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

class DeleteRecipe extends React.Component
{
    constructor()
    {
        super();
        // container for any message needing to be displayed in the component
		this.message = '';
    }

    componentDidMount()
    {
        const uri = window.location;

        // using regex to extract the parameter out of the URI
		const regex = /id=[[a-zA-Z0-9]+/;
        const extracted = regex.exec(uri);
        
        const recipeID = extracted[0].slice(3);

        // TODO: fetch API (look at view Recipe for guidance)
        deleteRecipe(recipeID)
            .then(response => response.json())
            .then(json => this.setState({info : jwt_decode(json)}));
    }

    render()
    {
        return(
            <div>
                <h1>Would you like to delete current recipe?</h1>
                <Link to=''>
                    <Button type="button" className="btn btn-info">Yes</Button>
                </Link>
                <br />
                <Link to='https//'>
                    <Button type="button" className="btn btn-info">No</Button>
                </Link>

            </div>
        );
    }

}
export default DeleteRecipe;