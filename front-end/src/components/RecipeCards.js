// React imports
import React from 'react';
import Card from 'react-bootstrap/esm/Card';
import Button from 'react-bootstrap/esm/Button';

const RecipeCards = async (recipes) =>
{
	console.log('in the function');
	console.log(recipes);

	const createCard = (recipe) => {
		return (
			<Card className="recipe-card">
				<Card.Img src={recipe.picture} />
				<Card.Body>
					<Card.Title>{recipe.title}</Card.Title>
					<Button variant="primary" className="view-button">View</Button>
				</Card.Body>
			</Card>
		);
	}

	return (
		<div>
			{recipes.map(createCard)}
		</div>
	);
}

export default RecipeCards;
