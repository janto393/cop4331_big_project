// Program dependencies
const bodyParser = require('body-parser');
const cors = require('cors');
const unitConversion = require('convert-units');
require('dotenv').config();
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Environment variables
const PORT = process.env.PORT || 5000;
app.set('port', (process.env.PORT || 5000));
const url = process.env.MONGODB_URI;

// Initialize database object and connect
const client = new MongoClient(url, { useUnifiedTopology: true });
client.connect();

// Access Control Logic
app.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

// Create new recipe endpoint. 
app.post('/createRecipe', async (request, response, next) =>
{
  // incoming: userID, publicRecipe, isMetric, title, instructions, ingredients
  // outgoing: recipeID, ingredients, error
	
	// Ingredients array offset constants (defined by location in the database validator)
	const INGREDIENT_NAME_INDEX = 0;
	const AMOUNT_METRIC_INDEX = 1;
	const UNIT_METRIC_INDEX = 2;
	const AMOUNT_IMPERIAL_INDEX = 3;
	const UNIT_IMPERIAL_INDEX = 4;

  var recipe = request.body;

  const INVALID_RECIPE = -1;
  var result = null;

  var returnPackage = {
												recipeID : INVALID_RECIPE,
												success : false,
                        error : ''
                      };

  const newRecipe = {
											author : recipe.userID,
											title : recipe.title, 
											publicRecipe : recipe.publicRecipe, 
											isMetric : recipe.isMetric,
											instructions : recipe.instructions,
											ingredients : recipe.ingredients
                  };

  // Traverse through ingredients for recipe
  for (var i = 0; i < ingredients.length; i++)
  {
		// Add ingredients to database if not already
    {
			var criteria = {
											name : recipe.ingredients[i][INGREDIENT_NAME_INDEX]
										 };

			try
			{
				const db = client.db(process.env.APP_DATABASE);
				result = await db.collection(process.env.COLLECTION_INGRDIENTS).findOne(criteria);
			}
			catch(e)
			{
				returnPackage.error = e.toString();
			}
			
			// Insert the ingredient if it doesn't exist
			if (!result)
			{
				try
				{
					const db = client.db(process.env.APP_DATABASE);
					db.collection(process.env.COLLECTION_INGRDIENTS).insertOne(criteria);

					result = await db.collection(process.env.COLLECTION_INGRDIENTS).findOne(criteria);
				}
				catch(e)
				{
					returnPackage.error = e.toString();
				}
			}
		}
		

		// Convert units and measurement system values for each ingredient
		{
			// convert from metric to imperial
			if (isMetric)
			{
				var amount = unitConversion.convert(ingredients[i][AMOUNT_METRIC_INDEX]).from(ingredients[i][UNIT_METRIC_INDEX]).to(ingredients[i][UNIT_IMPERIAL_INDEX]).toBest();
				recipe.ingredients[i][AMOUNT_IMPERIAL_INDEX] = amount;
			}

			// convert from imperial to metric
			else
			{
				var amount = unitConversion.convert(ingredients[i][AMOUNT_IMPERIAL_INDEX]).from(ingredients[i][UNIT_IMPERIAL_INDEX]).to(ingredients[i][UNIT_METRIC_INDEX]).toBest();
				recipe.ingredients[i][AMOUNT_METRIC_INDEX] = amount;
			}
		}
  }
  

  // Inserts new recipe record.
  try
  {
    const db = client.db(process.env.APP_DATABASE);
    db.collection(process.env.COLLECTION_RECIPES).insertOne(newRecipe);

		result = await db.collection(process.env.COLLECTION_RECIPES).findOne(newRecipe);
  }
  catch(e)
  {
    returnPackage.error = e.toString();
    response.status(500).json(returnPackage);
    return;
  }

  // Assigns return package values. 
  if (result)
  {
    returnPackage.recipeID = result.userID;
    returnPackage.ingredients = result.ingredients;
  }
  response.status(200).json(returnPackage);
}
);

app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
