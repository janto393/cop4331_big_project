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
	
  const { publicRecipe,
          isMetric,
          title,
          author,
          instructions,
          ingredientsByRecipe
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
                    ingredientsByRecipe : ingredientsByRecipe // array of objects
                  };
  console.log(typeof instructions);
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
  // var ingredientID;
  // for (i = 0; i < ingredientsByRecipe.length; i++)
  // {
  //   var searchInd = {
  //                     name : ingredientsByRecipe[i].name
  //                   };

  //   // Possible issue what if the ingredient already exists and how does the ingredient id get acquired by front-end?

  //   // Checks if ingredient already exists. 
  //   try
  //   {
  //     const db = client.db(process.env.APP_DATABASE);
  //     var result = await db.collection(process.env.COLLECTION_INGRDIENTS).findOne(searchInd);
  //   }
  //   catch(e)
  //   {
  //     console.log(e.toString());
  //   }


  //   // If ingredient exist then don't add to list again.
  //   if (result)
  //   {
  //     ingredientID = result._id;
  //   }
  //   // If ingredient doesn't exist, add to collection. 
  //   else
  //   {
  //     // Need to find id of metric units/imperial units. 
  //     try
  //     {
  //       const db = client.db(process.env.APP_DATABASE);
  //       db.collection(process.env.COLLECTION_INGRDIENTS).insertOne(ingredientsByRecipe[i]);

  //       var result = await db.collection(process.env.COLLECTION_INGRDIENTS).findOne(ingredientsByRecipe[i]);
  //     }
  //     catch(e)
  //     {
  //       console.log(e.toString());
  //     }
  //     ingredientID = result._id;
  //   }
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
