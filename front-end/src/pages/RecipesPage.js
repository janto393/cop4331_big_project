// React imports
import React from 'react';

// Component imports
import RecipeCards from '../components/RecipeCards';

// environment variables
const PORT = (process.env.PORT || 5000);

const RecipesPage = () => {

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

	return(
		<div>
			<h1>Recipes List</h1>
			<RecipeCards recipes={ getRecipes() } />
		</div>
	);
};

export default RecipesPage;
