// React imports
import React from 'react';

// Component imports
import RecipeCards from '../components/RecipeCards';

// JWT imports
import jwt_decode from 'jwt-decode';

// environment variables
const PORT = (process.env.PORT || 5000);

function fetchRecipes()
{
	// Create a criteria package that will return any recipes
	var criteria = {
		title : null,
		category : null,
		fetchUserRecipes : false,
		userID : '',
		currentPage : 1,
		pageCapacity : 10
	}

	// fetch the recipes from the database
	try
	{
		const response = fetch('http://localhost:' + PORT + '/api/fetchRecipes',
			{
				method:'POST',
				body : JSON.stringify(criteria),
				headers : {'Content-Type': 'application/json'}});

		return response;
	}
	catch (e)
	{
		alert(e.toString());
		return [];
	}
}

class MyRecipesPage extends React.Component
{
	constructor()
	{
		super();
		this.state = {data : []};
	}

	componentDidMount()
	{
		fetchRecipes()
			.then(response => response.json())
			.then(json => this.setState({data: jwt_decode(json).recipes}));
	}

	render()
	{
		return (
			<div>
				<RecipeCards recipes={this.state.data} />
			</div>
		);
	}
}

export default MyRecipesPage;
