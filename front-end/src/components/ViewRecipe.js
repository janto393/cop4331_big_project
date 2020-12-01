// React imports
import React from 'react';
import { Image, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// CSS imports
import './ViewRecipe.css';

// jwt imports
import jwt_decode from 'jwt-decode';

import buildPath from '../scripts/buildPath';

async function fetchRecipe(id)
{
	// create a criteria package
	const criteria = {
		recipeID : id
	};

	// fetch the recipe from the database
	try
	{
		const response = fetch(buildPath('fetchRecipeByID'),
			{
				method:'POST',
				body : JSON.stringify(criteria),
				headers : {'Content-Type': 'application/json'}
			});

		return response;
	}
	catch (e)
	{
		console.log(e.toString());
		return;
	}
}


function renderCategory(category, index)
{
	return (
		<ListGroup.Item key={'category-' + index}>{category.name}</ListGroup.Item>
	);
}

function renderIngredient(ingredientArray, index)
{
	// get user data from local storage to determine what
	// units/amounts of ingredients to render
	const userData = localStorage.getItem('user_data');

	// index constants for the ingredient array structure
	const NAME_INDEX = 0;
	const AMOUNT_METRIC_INDEX = 1;
	const METRIC_UNIT_INDEX = 2;
	const AMOUNT_IMPERIAL_INDEX = 3;
	const IMPERIAL_UNIT_INDEX = 4;

	const name = ingredientArray[NAME_INDEX];
	var amount = 0;
	var unit = '';

	// get amount based on userdata unit system settings
	if (userData.usesMetric)
	{
		amount = ingredientArray[AMOUNT_METRIC_INDEX];
	}
	else
	{
		amount = ingredientArray[AMOUNT_IMPERIAL_INDEX];
	}

	// get unit based on userdata unit system settings
	if (userData.usesMetric)
	{
		unit = ingredientArray[METRIC_UNIT_INDEX];
	}
	else
	{
		unit = ingredientArray[IMPERIAL_UNIT_INDEX];
	}

	return (
		<ListGroup.Item key={'ingredient-' + index}>
			<ListGroup horizontal>
				<ListGroup.Item>
					{name}
				</ListGroup.Item>
				<ListGroup.Item>
					{Number(amount).toFixed(2)}
				</ListGroup.Item>
				<ListGroup.Item>
					{unit}
				</ListGroup.Item>
			</ListGroup>
		</ListGroup.Item>
	);
}

function renderInstruction(instruction, index)
{
	return (
		<ListGroup.Item key={'instruction-' + index}>
			<ListGroup horizontal>
				<ListGroup.Item>
					{'Step ' + (index + 1) + ':'}
				</ListGroup.Item>
				<ListGroup.Item>
					{instruction}
				</ListGroup.Item>
			</ListGroup>
		</ListGroup.Item>
	);
}



// takes a json package with the shematic of the return
// package from the fetchRecipByID API endpoint
function renderRecipe(recipe)
{
	// render an error message if API call failed
	if (!recipe.success)
	{
		return (
			<div className="recipe-failed-to-render-div">
				<h1 className="error-header">Oh No!</h1>
				<p className="error-msg">
					It looks like we failed to prepare the recipe that you wanted
					to view.
					<br />
					If you wish to contact <a href="mailto:browniepoints12345@gmail.com">support</a>, 
					please use reference this error message:
					<br />
					<span className="api-error-message">
						{recipe.error}
					</span>
				</p>
				<Link to="/recipes">Return to recipes</Link>
			</div>
		);
	}

	var userData = JSON.parse(localStorage.getItem('user_data'));

	const renderDeleteButton = () =>
	{
		if (recipe.author.userID === userData.userID)
		{
			return (
				<div className="delete-button-container">
					<Link to={'/DeleteRecipe?id=' + recipe.recipeID}>
						<Button variant="danger"> Delete </Button>
					</Link>
				</div>
			);
		}
		else
		{
			return (
				<div>

				</div>
			);
		}
	};

	return (
		<div className="recipe-div">
			<div className="recipe-title-div">
				<Image className="recipe-picture" src={recipe.picture} rounded />
				<h1 className="recipe-title">{recipe.title}</h1>
				<h4 className="author">{'Author: ' + recipe.author.name}</h4>
			</div>
			<div className="recipe-body">
				<div className="recipe-categories">
					<span className="recipe-section-title">Categories</span>
					<ListGroup horizontal className="category-list">
						{recipe.categories.map(renderCategory)}
					</ListGroup>
				</div>
				<div className="recipe-ingredients">
					<span className="recipe-title-section">Ingredients</span>
					<ListGroup>
						{recipe.ingredients.map(renderIngredient)}
					</ListGroup>
				</div>
				<div className="recipe-instructions">
					<span className="recipe-title-section">Instructions</span>
					<ListGroup className="instructions-list">
						{recipe.instructions.map(renderInstruction)}
					</ListGroup>
				</div>
				<div>
					{renderDeleteButton()}
				</div>
			</div>
		</div>
	);
}

class ViewRecipe extends React.Component
{
	constructor()
	{
		super();
		this.state = {recipe : {}};
		this.message = '';
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

		// extract the id value out of the id argument
		const recipeID = extracted[0].slice(3);

		// call function to submit the API call
		fetchRecipe(recipeID)
			.then(response => response.json())
			.then(json => this.setState({recipe : jwt_decode(json)}));
	}

	render()
	{
		return (
			<div className="view-recipe-dialog">
				{ renderRecipe(this.state.recipe) }
			</div>
		);
	}
}

export default ViewRecipe;
