// React imports
import React from 'react';

// Component includes
import ViewRecipe from '../components/ViewRecipe';

const ViewRecipePage = (recipeJson) => {

	return (
		<div>
			<ViewRecipe recipe={JSON.stringify(recipeJson)} />
		</div>
	);
};

export default ViewRecipePage;
