// React imports
import React from 'react';
import { Form } from 'react-bootstrap';

// Component imports
import RecipeCards from '../components/RecipeCards';

// JWT imports
import jwt_decode from 'jwt-decode';

// environment variables
const PORT = (process.env.PORT || 5000);

function fetchRecipes(title, category)
{
	// Create a criteria package that will return any recipes
	var criteria = {
		title : null,
		category : null,
		fetchUserRecipes : false,
		userID : ''
	}

	// filter title
	if (title !== '')
	{
		criteria.title = title;
	}

	// filter category
	if (category !== 'Any Category')
	{
		criteria.category = category;
	}

	// fetch the recipes from the database
	try
	{
		const response = fetch('https://brownie-points-4331-6.herokuapp.com:' + process.env.PORT + '/api/fetchRecipes',
			{
				method:'POST',
				body : JSON.stringify(criteria),
				headers : {'Content-Type': 'application/json'}});

		return response;
	}
	catch (e)
	{
		alert(e.toString());
		return [];
	}
}

class MyRecipesPage extends React.Component
{
	constructor()
	{
		super();
		this.state = {data : []};
		this.category = 'Any Category';
		this.title = '';
	}

	componentDidMount()
	{
		fetchRecipes()
			.then(response => response.json())
			.then(json => this.setState({data: jwt_decode(json).recipes}));
	}

	render()
	{
		const search = () =>
		{
			fetchRecipes(this.title, this.category)
				.then(response => response.json())
				.then(json => this.setState({data : jwt_decode(json).recipes}));
		};

		const handleCategoryChange = (cat) =>
		{
			this.category = cat.target.value;
			search();
		};

		const handleTitleChange = (title) =>
		{
			this.title = title.target.value;
			search();
		};

		return (
			<div>
				<div className="searchbar-div">
					<Form>
						<Form.Row>

							<Form.Group>
								<Form.Control type="text" placeholder="Recipe Title" onChange={handleTitleChange} />
							</Form.Group>
							
							<Form.Group>
								<Form.Control as="select" onChange={handleCategoryChange}>
									<option>Any Category</option>
									<option>Breakfast</option>
									<option>Lunch</option>
									<option>Dinner</option>
									<option>Dessert</option>
									<option>Drinks</option>
									<option>Snacks</option>
								</Form.Control>
							</Form.Group>

						</Form.Row>
					</Form>
				</div>
				<RecipeCards recipes={this.state.data} />
			</div>
		);
	}
}

export default MyRecipesPage;
