// React imports
import React from 'react';
import Card from 'react-bootstrap/esm/Card';
import { ListGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/esm/Button';
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
				<a href={'/viewRecipe?id=' + recipe._id}>
					<Card key={'recipe-'+index} className="recipe-card" style={{display: "inline-block"}}>
						<Card.Img className="card-img-top" src={recipe.picture} alt={recipe.picture.toString()} />
						<Card.Body className="card-body">
							<div className="card-info">
								<p className="card-title">{recipe.title}</p>
							</div>
						</Card.Body>
					</Card>
				</a>
		);
		
	
	}

	return (
		<div>
			{ (json.recipes.length > 0) ? json.recipes.map(createCard) : <NoRecipes />}
		</div>
	);
}

export default RecipeCards;
