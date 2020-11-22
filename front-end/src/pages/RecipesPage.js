// React imports
import React from 'react';

// Component imports
import RecipeCards from '../components/RecipeCards';

// environment variables
const PORT = (process.env.PORT || 5000);

const getRecipes = async () =>
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

	var recipeData;

	// fetch the recipes from the database
	try
	{
		const response = await fetch('http://localhost:' + PORT + '/api/fetchRecipes',
			{
				method:'POST',
				body : JSON.stringify(criteria),
				headers : {'Content-Type': 'application/json'}});

		recipeData = await JSON.parse(await response.text());
	}
	catch (e)
	{
		alert(e.toString());
		return;
	}

	return await recipeData.recipes;
}

// const RecipesPage = () => {

// 	var recipes = getRecipes();

// 	console.log(recipes);

// 	return (
// 		<div>
// 			<h1>Recipes List</h1>
// 			{/* <RecipeCards recipes={ getRecipes() } /> */}
// 		</div>
// 	);
// };

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

class RecipesPage extends React.Component
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
			.then(json => this.setState({data: json.recipes}));
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

export default RecipesPage;
