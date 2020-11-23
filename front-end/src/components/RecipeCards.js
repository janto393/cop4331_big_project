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
				<Card.Img className="card-img-top" src={recipe.picture} alt={recipe.picture.toString()} />
				<Card.Body className="card-body">
					<div className="card-info">
						<p className="card-title">{recipe.title}</p>
						<Button variant="primary" className="view-button">View</Button>
					</div>
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
