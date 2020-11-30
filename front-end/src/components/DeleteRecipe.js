// React imports
import React from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

async function deleteRecipe(id)
{
    // create a criteria package
	const criteria = {
        recipeID : id
    };

    try
	{
		const response = fetch('https://brownie-points-4331-6.herokuapp.com/api/deleteRecipe',
			{
				method:'POST', 
				body : JSON.stringify(criteria),
				headers : {'Content-Type': 'application/json'}
			});

        
        if(!response.success)
        {
            console.log(response.error)
            return;
        }
        // Route back to recipes
        else
        {
            return;
        }	
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
        this.recipeID = "";
    }

    componentDidMount()
    {
        const uri = window.location;

        // using regex to extract the parameter out of the URI
				const regex = /id=[[a-zA-Z0-9]+/;
				const extracted = regex.exec(uri);
				
				// check if uri was passed correctly
				if (extracted.length < 1)
				{
					this.message = 'URI malformed';
					return;
				}
        
        const recipeID = (extracted[0].slice(3)).toString();
        this.recipeID = recipeID;
    }

    render()
    {
        return(
            <div>
                <h1>Are you sure you want to delete the current recipe?</h1>
                <Link to='/recipes'>
                    <Button type="button" className="btn btn-info" onClick={() => deleteRecipe(this.recipeID)}>Yes</Button>
                </Link>
                <br />
                <Link to='/recipes'>
                    <Button type="button" className="btn btn-info">No</Button>
                </Link>
            </div>
        );
    }

}
export default DeleteRecipe;
