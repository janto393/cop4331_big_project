// React imports
import React from 'react';

const ViewRecipe = (recipe) => {
	
	var info = JSON.parse(recipe);

	return (
		<div className="view-recipe-container">
			<div>
				<img src={info.picture} className="view-recipe-image" />
				<h1 className="recipe-title">{info.title}</h1>
			</div>
			<div>
				
			</div>
		</div>
	);
}

export default ViewRecipe;
