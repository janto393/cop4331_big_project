// React imports
import React from 'react';
import Card from 'react-bootstrap/esm/Card';
import Button from 'react-bootstrap/esm/Button';

// CSS imports
import './RecipeCards.css';

const RecipeCards = (json) =>
{
	const createCard = (recipe, key) => {
		return (
			<Card key={key} className="recipe-card">
				<Card.Img src={recipe.picture} alt="RecipePicture" />
				<Card.Body>
					<Card.Title>{recipe.title}</Card.Title>
					<Button variant="primary" className="view-button">View</Button>
				</Card.Body>
			</Card>
		);
	}

	return (
		<div>
			{json.recipes.map(createCard)}
		</div>
	);
}

export default RecipeCards;
