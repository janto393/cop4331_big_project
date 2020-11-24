// React imports
import React from 'react';
import { Link } from 'react-router-dom';

// CSS imports
import './NoRecipes.css';

const NoRecipes = () =>
{
	return (
		<div className="no-recipes-dialog">
			<p className="dialog-text">
				There are currently no recipes to display.
			</p>
			<Link to="createrecipe">Try creating a recipe!</Link>
		</div>
	);
}

export default NoRecipes;
