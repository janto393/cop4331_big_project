// Program dependencies
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const { ObjectID } = require('mongodb');
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

// Add Ingredient Endpoint
app.post('/addIngredient', async (request, response, next) =>
{
	/*
		Incoming:
		{
			name : string
		}
		Outgoing:
		{
			ingredientID : objectID,
			success : bool,
			error : ''
		}
	*/

	var returnPackage = {
												ingredientID : null,
												success : false,
												error : ''
											};

	// ensure we are not inserting a duplicate
	try
	{
		const db = await client.db(process.env.APP_DATABASE);

		const criteria = {
											 name : request.body.name.toLowerCase()
										 };

		var result = await db.collection(process.env.COLLECTION_INGREDIENTS).findOne(criteria);

		// exit if ingredient is ready added
		if (result)
		{
			returnPackage.ingredientID = result._id;
			returnPackage.success = true;
			response.status(200).json(returnPackage);
			return;
		}
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		response.status(500).json(returnPackage);
		return;
	}

	// insert the ingredient to the database
	try
	{
		const db = await client.db(process.env.APP_DATABASE);
		
		const criteria = {
											 name : request.body.name.toLowerCase()
										 };

		db.collection(process.env.COLLECTION_INGREDIENTS).insertOne(criteria);

		// need to search it in the database to get the id of the ingredient
		var result = await db.collection(process.env.COLLECTION_INGREDIENTS).findOne(criteria);

		returnPackage.ingredientID = result._id;
		returnPackage.success = true;
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		response.status(500).json(returnPackage);
		return;
	}

	response.status(200).json(returnPackage);
});


// Fetches all units depending on system selected
app.post('/fetchUnits', async (request, response, next) => {
	/*
		Incoming:
		{
			isMetric : bool
		}

		Outgoing:
		{
			units : array,
			error : string
		}
	*/

	var collection;

	var returnPackage = {
												units : [],
												error : ''
											};


	// Determine collection to pull from
	if (request.body.isMetric)
	{
		collection = process.env.COLLECTION_METRIC_UNITS;
	}
	else
	{
		collection = process.env.COLLECTION_IMPERIAL_UNITS;
	}

	// Fetch the units from the database
	try
	{
		const db = await client.db(process.env.APP_DATABASE);

		const data = await db.collection(collection).find().toArray();

		// exit if no units were returned
		if (!data)
		{
			returnPackage.error = 'No units returned from database.';
			response.status(400).json(returnPackage);
			return;
		}

		returnPackage.units = data;
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		response.status(500).json(returnPackage);
		return;
	}

	response.status(200).json(returnPackage);
});


// Find Ingredient Endpoint
app.post('/findIngredient', async (request, response, next) => {
	/*
		Incoming:
		{
			name : string
		}

		Outgoing:
		{
			ingredientID : string,
			name : string,
			error : string
		}
	*/

	returnPackage = {
										ingredientID : '',
										name : '',
										error : ''
									};

	// look for ingredient in database
	try
	{
		const db = await client.db(process.env.APP_DATABASE);

		const criteria = {
											 name : request.body.name.toLowerCase()
										 };

		var result = await db.collection(process.env.COLLECTION_INGREDIENTS).findOne(criteria);

		if (result)
		{
			returnPackage.ingredientID = result._id;
			returnPackage.name = result.name;
		}
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		response.status(500).json(returnPackage);
		return;
	}

	response.status(200).json(returnPackage);
});


// Matches imperial to metric units for conversion package
app.post('/fromImperialToMetric', async (request, response, next) =>
{
	/*
		Icomming:
		{
			unit : string
		}

		Outgoing:
		{
			unit : string,
			error : string
		}
	*/

	var returnPackage = {
												unit : '',
												error : ''
											};

	// lb to kg
	if (request.body.unit == 'lb')
	{
		returnPackage.unit = 'kg';
	}

	// oz to g
	else if (request.body.unit == 'oz')
	{
		returnPackage.unit = 'g';
	}

	// fl-oz, cup, quart, tsp, tbsp to ml
	else if ((request.body.unit == 'fl-oz') ||
					 (request.body.unit == 'cup') ||
					 (request.body.unit == 'qt') ||
					 (request.body.unit == 'tsp') ||
					 (request.body.unit == 'tbsp'))
	{
		returnPackage.unit = 'ml';
	}

	// gallon to liter
	else if (request.body.unit == 'gal')
	{
		returnPackage.unit = 'l';
	}

	// farenheit to celsius
	else if (request.body.unit == 'f')
	{
		returnPackage.unit = 'c';
	}

	// Unit could not be converted
	else
	{
		returnPackage.error = 'Unit could not be compared.';
	}

	response.status(200).json(returnPackage);
});


// Matches metric to imperial unit for conversion package
app.post('/fromMetricToImperial', async (request, response, next) =>
{
	/*
		Incoming:
		{
			unit : string
		}

		Output:
		{
			unit : string,
			error : string
		}
	*/

	var returnPackage = {
												unit : '',
												error : ''
											};
	
	// ml to tsp
	if (request.body.unit == 'ml')
	{
		returnPackage.unit = 'tsp';
	}

	// l to gallons
	else if (request.body.unit == 'l')
	{
		returnPackage.unit = 'gal';
	}

	// g to oz
	else if (request.body.unit == 'g')
	{
		returnPackage.unit = 'oz';
	}

	// kg to lb
	else if (request.body.unit == 'kg')
	{
		returnPackage.unit = 'lb';
	}

	// c to f
	else if (request.body.unit == 'c')
	{
		returnPackage.unit = 'f';
	}

	// Unit could not be converted
	else
	{
		returnPackage.error = 'Unit could not be compared.';
	}


	response.status(200).json(returnPackage);
});


// Modify Recipe Endpoint
app.post('/modifyRecipe', async (request, response, next) =>
{
	/*
		Incoming (NULL indicates no change in field):
		{
			recipeID : string,
			publicRecipe : bool || NULL,
			title : string || NULL,
			instructions : [] || NULL,
			categories : [] || NULL,
			ingredients : [] || NULL
		}

		Outgoing:
		{
			success : bool,
			recipeID : string,
			error : string
		}
	*/

	// Empty package on initialization, fields will be populated as changes to recipe are parsed
	var updatePackage = {$set : {}};

	const criteria = {_id : ObjectID(recipeID)};

	var returnPackage = {
												success : false,
												recipeID : '',
												error : ''
											};

	
	// Check if publicRecipe changed
	if (request.body.publicRecipe != null)
	{
		updatePackage.$set.publicRecipe = request.body.publicRecipe;
	}

	// Check if title changed
	if (request.body.title != null)
	{
		updatePackage.$set.title = request.body.title.toLower();
	}

	// Check if instructions changed
	if (request.body.title != null)
	{
		updatePackage.$set.title = request.body.instructions;
	}

	// Check if categories changed
	if (request.body.categories != null)
	{
		updatePackage.$set.body.categories = request.body.categories;
	}

	// Check if ingredients changed
	if (request.body.ingredients != null)
	{
		updatePackage.$set.body.ingredients = request.body.ingredients;
	}

	// Update recipe if needed
	if (Object.keys(updatePackage.$set).length > 0)
	{
		// update recipe in the database
		try
		{
			const db = client.db(process.env.APP_DATABASE);
			db.collection(process.env.COLLECTION_RECIPES).updateOne(criteria, updatePackage);
		}
		catch (e)
		{
			returnPackage.error = e.toString();
			response.status(500).json(returnPackage);
			return;
		}
	}

	response.status(200).json(returnPackage);
});


// Register Endpoint
app.post('/registerUser', async (request, response, next) =>
{
  // incoming: userId, color
  // outgoing: userID, username, email, firstName, lastName, profilePicture
  // isVerified, favoriteRecipes, error
	
	const { username,
					password,
					email,
					firstName,
					lastName,
					profilePicture
				} = request.body;

  const INVALID_USER = -1;
  var result = null;

  var returnPackage = {
                        userID : INVALID_USER,
                        username : '',
                        email : '',
                        firstName : '',
                        lastName : '',
                        profilePicture : profilePicture,
                        isVerified : false,
                        favoriteRecipes : [],
                        error : ''
                      };

  const newUser = {
                    username : username, 
                    password : password, 
                    email : email,
                    firstName : firstName,
                    lastName : lastName,
                    profilePicture : profilePicture,
                    isVerified : false,
                    favoriteRecipes : []
                  };

  // Check if user name is already taken.
  try 
  {
		const db = client.db(process.env.APP_DATABASE);
		
    const criteria = {
                        username : username
                      };
		const data = await db.collection(process.env.COLLECTION_USERS).findOne(criteria);
		
    if (data)
    {
      throw "User name already taken.";
    }
  }
  catch(e)
  {
    returnPackage.error = e.toString();
    response.status(400).json(returnPackage);
    return;
  }

  // Inserts new user record. 
  try
  {
    const db = client.db(process.env.APP_DATABASE);
    db.collection(process.env.COLLECTION_USERS).insertOne(newUser);

		var result = await db.collection(process.env.COLLECTION_USERS).findOne(newUser);
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
    returnPackage.userID = result.userID;
    returnPackage.username = result.username;
    returnPackage.email = result.email;
    returnPackage.firstName = result.firstName;
    returnPackage.lastName = result.lastName;
    returnPackage.profilePicture = result.profilePicture;
    returnPackage.isVerified = result.isVerified;
    returnPackage.favoriteRecipes = result.favoriteRecipes;
  }
  response.status(200).json(returnPackage);
}
);

app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
