// Program dependencies
const bodyParser = require('body-parser');
const cors = require('cors');
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
  // incoming: userID, publicRecipe, isMetric, title, instructions, ingredientsByRecipe
  // outgoing: recipeID, ingredients, error
	
  const { userID,
          publicRecipe,
          isMetric,
          title,
          instructions,
          ingredientsByRecipe
				} = request.body;

  const INVALID_RECIPE = -1;
  var result = null;

  var returnPackage = {
                        recipeID : INVALID_RECIPE,
                        ingredients : [],
                        error : ''
                      };

  const newRecipe = {
                    title : title, 
                    publicRecipe : publicRecipe, 
                    isMetric : isMetric,
                    instructions : instructions,
                    ingredientsByRecipe : ingredientsByRecipe
                  };

  // Check if recipe name is already taken.
  try 
  {
		const db = client.db(process.env.APP_DATABASE);
		
    const criteria = {
                        title : title
                      };
		const data = await db.collection(process.env.COLLECTION_RECIPES).findOne(criteria);
		
    if (data)
    {
      throw "Recipe name taken.";
    }
  }
  catch(e)
  {
    returnPackage.error = e.toString();
    response.status(400).json(returnPackage);
    return;
  }

  // Seperate function to insert incredients to db if they don't exist already. 
  // Travse through array of objects 
  var i;
  for (i = 0; i < ingredientsByRecipe.length; i++)
  {
    var searchInd = {
                      name : ingredientsByRecipe[i].name
                    };

    try
    {
      const db = client.db(process.env.APP_DATABASE);
      var result = await db.collection(process.env.COLLECTION_INGRDIENTS).findOne(searchInd);
    }
    catch(e)
    {
      console.log(e.toString());
    }
    // If ingredient exist then don't add to list again.
    if (result)
    {
      continue;
    }
    // If ingredient doesn't exist, add to collection. 
    else
    {
      // Essentially same code as for register. Add seperate function.
      try
      {
        const db = client.db(process.env.APP_DATABASE);
        db.collection(process.env.COLLECTION_INGRDIENTS).insertOne(ingredientsByRecipe[i]);

        var result = await db.collection(process.env.COLLECTION_INGRDIENTS).findOne(ingredientsByRecipe[i]);
      }
      catch(e)
      {
        console.log(e.toString());
      }
    }
  }
  

  // Inserts new recipe record.
  try
  {
    const db = client.db(process.env.APP_DATABASE);
    db.collection(process.env.COLLECTION_RECIPES).insertOne(newRecipe);

		var result = await db.collection(process.env.COLLECTION_RECIPES).findOne(newRecipe);
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
app.listen(5000); // start Node + Express server on port 5000




app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
