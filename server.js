// Program dependencies
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const objectID = require('mongodb').ObjectID;
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

  // JSON query package
  // {
  //   "author": "5fa613c408e77205a8e4aebe",
  //   "publicRecipe": false,
  //   "isMetric": true,
  //   "title": "Gingerbread man",
  //   "instructions": ["Mix ingredients", "Bake for 10 mins"],
  //   "ingredients": [{}]
  // }
	
  const { publicRecipe,
          isMetric,
          title,
          author,
          instructions,
          ingredients
				} = request.body;

  const INVALID_RECIPE = -1;
  var result = null;
  var authorID = objectID(author);

  var returnPackage = {
                        recipeID : INVALID_RECIPE,
                        ingredients : [],
                        error : ''
                      };

  const newRecipe = {
                    title : title, 
                    author : authorID,  // user id
                    publicRecipe : publicRecipe, 
                    isMetric : isMetric,
                    instructions : instructions, // array of strings with each index representing a step.
                    ingredients : [] // array of objects
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
 
  // Travse through array of objects 
  // 1. Check if ingredients are in database.
  //    -if yes, grab objectid and add into json
  //    -if no, insert into ingredients database and grab objectid
  // 2. Check value of ismetric
  //    -if yes, insert amount and search for metric unit in Unit_metric database.
  //    -if no, insert amount and search for imperial unit in Unit_imperial database.


  // ingredientsByRecipe api?
  // var i;
  // var name;
  // var amount;
  // var units;
  // for (i = 0; i < ingredients.length; i++)
  // {
  //   name = objectID(ingredients[i].name);
  //   amount = ingredients[i].amount;
  //   units = objectID(ingredients[i].units);
  //   newRecipe.ingredients[i] = {name : name, amount : amount, units : units}
  //   console.log(newRecipe.ingredients[i]);
  // }
  

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
console.log(result);
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
