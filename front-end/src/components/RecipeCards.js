// React imports
import React from 'react';
import Card from 'react-bootstrap/esm/Card';
import { CardDeck } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// CSS imports
import './RecipeCards.css';

// Component imports
import NoRecipes from './NoRecipes';

const RecipeCards = (json) =>
{
	const createCard = (recipe, index) =>
	{
		return (
			<Card key={'recipe-'+index} className="recipe-card">
				<Link to={'/viewRecipe?id=' + recipe._id}>
					<Card.Img className="card-img-top" src={recipe.picture} alt={recipe.picture.toString()} />
					<Card.Body className="card-body">
						<div className="card-info">
							<p className="card-title">{recipe.title}</p>
						</div>
					</Card.Body>
				</Link>
			</Card>
		);
	}

	return (
		<div>
			<CardDeck>
				{ (json.recipes.length > 0) ? json.recipes.map(createCard) : <NoRecipes />}
			</CardDeck>
		</div>
	);
}

export default RecipeCards;
