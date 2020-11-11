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
	
  const {
					userID,
          publicRecipe,
          isMetric,
          title,
          instructions,
          ingredients
				} = request.body;

  const INVALID_RECIPE = -1;
  var result = null;

  var returnPackage = {
                        recipeID : INVALID_RECIPE,
                        error : ''
                      };

  const newRecipe = {
											author : userID,
											title : title, 
											publicRecipe : publicRecipe, 
											isMetric : isMetric,
											instructions : instructions,
											ingredients : ingredients
                  };

  // Seperate function to insert ingredients to db if they don't exist already. 
  // Travse through array of objects 
  for (var i = 0; i < ingredients.length; i++)
  {
    var criteria = {
                      name : ingredients[i].name
                    };

    try
    {
      const db = client.db(process.env.APP_DATABASE);
      result = await db.collection(process.env.COLLECTION_INGRDIENTS).findOne(criteria);
    }
    catch(e)
    {
      console.log(e.toString());
		}
		
    // Insert the ingredient if it doesn't exist
    if (!result)
    {
			continue;
			// Essentially same code as for register. Add seperate function.
      try
      {
        const db = client.db(process.env.APP_DATABASE);
        db.collection(process.env.COLLECTION_INGRDIENTS).insertOne(criteria);

        var result = await db.collection(process.env.COLLECTION_INGRDIENTS).findOne(criteria);
      }
      catch(e)
      {
        returnPackage.error = e.toString();
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
