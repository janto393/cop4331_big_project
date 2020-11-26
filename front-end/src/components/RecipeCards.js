// React imports
import React from 'react';
import Card from 'react-bootstrap/esm/Card';
import Button from 'react-bootstrap/esm/Button';
import { Link } from 'react-router-dom';

// CSS imports
import './RecipeCards.css';

// Component imports
import NoRecipes from './NoRecipes';

const RecipeCards = (json) =>
{
	const createCard = (recipe, key) =>
	{
		return (
			<Card key={key} className="recipe-card">
				<Card.Img className="card-img-top" src={recipe.picture} alt={recipe.picture.toString()} />
				<Card.Body className="card-body">
					<div className="card-info">
						<p className="card-title">{recipe.title}</p>
						<Link to={'/viewRecipe?id=' + recipe._id}>
							<Button variant="primary" className="view-button">View</Button>
						</Link>
					</div>
				</Card.Body>
			</Card>
		);
	}

	return (
		<div>
			{ (json.recipes.length > 0) ? json.recipes.map(createCard) : <NoRecipes />}
		</div>
	);
}

export default RecipeCards;
