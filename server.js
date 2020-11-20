// Program dependencies
const bodyParser = require('body-parser');
const unitConversion = require('convert-units');
const cors = require('cors');
const { response, request } = require('express');
require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
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
app.use((request, response, next) => 
{
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-requestuested-With, Content-Type, Accept, Authorization'
  );
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});


// Create new recipe endpoint. 
app.post('/api/createRecipe', async (request, response, next) =>
{	
	/*
		Incoming:
		{
			isMetric : bool,
			picture : string,
			publicRecipe : bool,
			title : string,
			author : string,
			instructions : array,
			categories : array,
			ingredients : array
		}

		Outgoing:
		{
			recipeID : string,
			categories : array,
			ingredients : array,
			error : string
		}
	*/

	var returnPackage = {
												recipeID : '',
												categories : [],
												ingredients : [],
												error : ''
											};

	var ingredientPayload = {
														isMetric : request.body.isMetric,
														ingredients : request.body.ingredients
													};

	var categoriesPayload = {
														categories : request.body.categories
													}

	try
	{
		var processedIngredients = await processIngredients(ingredientPayload);
		var processedCategories = await processCategories(categoriesPayload);
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		response.status(500).json(returnPackage);
		return;
	}

	

	// create json of new recipe to be inserted into database
	var newRecipe = {
										picture : request.body.picture,
										publicRecipe : request.body.publicRecipe,
										title : request.body.title.toLowerCase(),
										author : ObjectID(request.body.author),
										instructions : request.body.instructions,
										categories : processedCategories.databaseCategories,
										ingredients : processedIngredients.databaseIngredients
									};

	// Insert the new recipe into the database
	try
	{
		const db = await client.db(process.env.APP_DATABASE);
		await db.collection(process.env.COLLECTION_RECIPES).insertOne(newRecipe);

		var result = await db.collection(process.env.COLLECTION_RECIPES).findOne(newRecipe);

		returnPackage.recipeID = result._id;
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		response.status(500).json(returnPackage);
		return;
	}

	// Assign values to the return package
	returnPackage.ingredients = processedIngredients.frontendIngredients;
	returnPackage.categories = processedCategories.frontendCategories;
	
  response.status(200).json(returnPackage);
});


// delete recipe endpoint
app.post('/api/deleteRecipe', async (request, response, next) =>
{
	/*
		Incoming:
		{
			recipeID : string
		}

		outgoing:
		{
			success : bool,
			error : string
		}
	*/

  var recipeToDelete = {
					_id : ObjectID(request.body.recipeID)
	};

  var returnPackage = {
						success : false,
						error : ''
					  };
					  
  // Delete recipe record. 
  try
  {
		const db = await client.db(process.env.APP_DATABASE);
		
		var result = await db.collection(process.env.COLLECTION_RECIPES).deleteOne(recipeToDelete);

		if (result.deletedCount == 1)
		{
			returnPackage.success = true;
		}
		else
		{
			returnPackage.error = 'Recipe was not deleted or didn\'t exist to begin with'
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


// edit favorite recipes Endpoint
app.post('/api/editFavoriteRecipes', async (request, response, next) =>
{
	/*
		Incoming:
		{
			userID : string,
			favorites : array
		}

		Outgoing:
		{
			userID : string,
			success : bool,
			error : string
		}
	*/
	
  const INVALID_USER = -1;

  var returnPackage = {
    userID : INVALID_USER,
		success : false,
		favorites : [],
		error : ''
	};
	
	const user = {
		_id : ObjectID(request.body.userID)
	};

	var updatePackage = {
		$set : {
			favoriteRecipes : []
		}
	};

	// convert the strings in the favorites array to objectIDs
	for (var i = 0; i < request.body.favorites.length; i++)
	{
		updatePackage.$set.favoriteRecipes.push(ObjectID(request.body.favorites[i]));
	}
	
  // Update user record
  try
  {
		const db = await client.db(process.env.APP_DATABASE);
		
		await db.collection(process.env.COLLECTION_USERS).updateOne(user, updatePackage);

		var result = await db.collection(process.env.COLLECTION_USERS).findOne(user);

		if (result)
		{
			returnPackage.userID = result._id;
			returnPackage.success = true;
			returnPackage.favorites = result.favoriteRecipes;
		}
  }
  catch(e)
  {
    returnPackage.error = e.toString();
    response.status(500).json(returnPackage);
    return;
	}

  response.status(200).json(returnPackage);
});


// Fetches all units depending on system selected
app.post('/api/fetchUnits', async (request, response, next) => {
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


// Fetches recipes according to title
app.post('/api/fetchRecipes', async (request, response, next) => {
	/*
		Incoming:
		{
			title : string || NULL,
			category : string || NULL,
			fetchUserRecipes : bool,
			userID : string,
			currentPage : integer,
			pageCapacity : integer
		}

		Outgoing:
		{
			recipes : array,
			numInPage : integer,
			totalNumRecipes : integer,
			error : string
		}
	*/

	// Determines how many results have already been displayed and skips them
	const skipOffset = (request.body.currentPage - 1) * request.body.pageCapacity;
	const pageCapacity = request.body.pageCapacity;

	var returnPackage = {
												recipes : [],
												numInPage : 0,
												totalNumRecipes : 0,
												error : ''
											};

	// Empty package on initialization, will be populated as we preocess input
	var criteria = {}

	// process title
	if ((request.body.title != null) && (typeof request.body.title == 'string'))
	{
		// format the title into a regex equivalent of SQL's "like"
		criteria.title =  {$regex : ('^' + request.body.title.toLowerCase())};
	}

	// process category
	if ((request.body.category != null) && (typeof request.body.category == 'string'))
	{
		// package the category given into format for the helper function
		const rawCategories = {
			categories : [request.body.category]
		}

		try
		{
			var processedCategories = (await processCategories(rawCategories)).databaseCategories;

			// Only take the first element since we are only searching by one category at a time
			if (processedCategories.length > 0)
			{
				criteria.category = ObjectID(processedCategries[0]);
			}
		}
		catch (e)
		{
			returnPackage.error = e.toString();
			response.status(400).json(returnPackage);
			return;
		}
	}

	// process if we are fetching user recipes only
	if (request.body.fetchUserRecipes)
	{
		criteria.author = ObjectID(request.body.userID);
	}

	// Query database based on title
	try
	{
		const db = await client.db(process.env.APP_DATABASE);

		var result = await db.collection(process.env.COLLECTION_RECIPES).find(criteria).skip(skipOffset).limit(pageCapacity).toArray();

		returnPackage.recipes = result;
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
app.post('/api/findIngredient', async (request, response, next) => {
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


// login endpoint
app.post('/api/login', async (request, response, next) => 
{
	/*
		Incoming:
		{
			username : string,
			password : string
		}

		Outgoing:
		{
			success : bool,
			userID : string,
			username : string,
			email : string,
			firstname : string,
			lastname : string,
			usesMetric : bool,
			favoriteRecipes : array,
			error : string
		}
	*/

	const INVALID_CREDENTIALS = 'Invalid Username/Password';

	var returnPackage = {
		success : false,
		userID : '',
		username : '',
		email : '',
		firstname : '',
		lastname : '',
		usesMetric : false,
		favoriteRecipes : [],
		error : ''
	}

	// try to locate user in the database
	try
	{
		const db = await client.db(process.env.APP_DATABASE);

		const criteria = {
			username : request.body.username.toLowerCase(),
			password : request.body.password
		}

		var result = await db.collection(process.env.COLLECTION_USERS).findOne(criteria);

		// check if user does not exist or password doesn't match
		if ((!result) || (result.password !== request.body.password))
		{
			returnPackage.error = INVALID_CREDENTIALS;
			response.status(400).json(returnPackage);
			return;
		}

		// parse the user information into the return package
		returnPackage.userID = result._id;
		returnPackage.username = result.username;
		returnPackage.email = result.email;
		returnPackage.firstname = result.firstName;
		returnPackage.lastname = result.lastName;
		returnPackage.usesMetric = result.usesMetric;
		returnPackage.favoriteRecipes = result.favoriteRecipes;
	}
	catch (e)
	{
		returnPackage.error = e.toString;
		response.status(500).json(returnPackage);
		return;
	}

	returnPackage.success = true;
	response.status(200).json(returnPackage);
});


// Modify Recipe Endpoint
app.post('/api/modifyRecipe', async (request, response, next) =>
{
	/*
		Incoming (NULL indicates no change in field):
		{
			recipeID : string,
			isMetric : bool,
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

	const criteria = {_id : ObjectID(request.body.recipeID)};

	var returnPackage = {
												success : false,
												recipeID : '',
												error : ''
											};

	
	// Check if publicRecipe changed
	if ((request.body.publicRecipe != null) && (typeof request.body.publicRecipe == 'boolean'))
	{
		updatePackage.$set.publicRecipe = request.body.publicRecipe;
	}

	// Check if title changed
	if ((request.body.title != null) && (typeof request.body.title == 'string'))
	{
		updatePackage.$set.title = request.body.title.toLowerCase();
	}

	// Check if instructions changed
	if ((request.body.instructions != null) && (typeof request.body.instructions == 'object'))
	{
		updatePackage.$set.instructions = request.body.instructions;
	}

	// Check if categories changed
	if ((request.body.categories != null) && (typeof request.body.categories == 'object'))
	{
		try
		{
			let categoriesPayload = {
				categories : request.body.categories
			}

			updatePackage.$set.categories = (await processCategories(categoriesPayload)).databaseCategories;
		}
		catch (e)
		{
			returnPackage.error = e.toString();
			response.status(400).json(returnPackage);
			return;
		}
	}

	// Check if ingredients changed
	if ((request.body.ingredients != null) && (typeof request.body.ingredients == 'object'))
	{
		try
		{
			let ingredientsPayload = {
				isMetric : request.body.isMetric,
				ingredients : request.body.ingredients
			}

			updatePackage.$set.ingredients = (await processIngredients(ingredientsPayload)).databaseIngredients;
		}
		catch (e)
		{
			returnPackage.error = e.toString();
			response.status(400).json(returnPackage);
			return;
		}
	}

	// Update recipe if needed
	if (Object.keys(updatePackage.$set).length > 0)
	{
		// update recipe in the database
		try
		{
			const db = await client.db(process.env.APP_DATABASE);
			await db.collection(process.env.COLLECTION_RECIPES).updateOne(criteria, updatePackage);
		}
		catch (e)
		{
			returnPackage.error = e.toString();
			response.status(500).json(returnPackage);
			return;
		}
	}

	returnPackage.success = true;
	response.status(200).json(returnPackage);
});


// Register Endpoint
app.post('/api/registerUser', async (request, response, next) =>
{
	/*
		Incoming:
		{
			username : string,
			password : string,
			email : string,
			firstname : string,
			lastname : string,
			usesMetric : bool,
		}

		Outgoing:
		{
			success : bool,
			userID : string,
			username : string,
			email : string,
			firstname : string,
			lastname : string,
			usesMetric : bool,
			error : string
		}
	*/

  var returnPackage = {
		success : false,
		userID : '',
		username : '',
		email : '',
		firstname : '',
		lastname : '',
		usesMetric : false,
		isVerified : false,
		error : ''
	}

  const newUser = {
		username : request.body.username.toLowerCase(),
		password : request.body.password,
		email : request.body.email,
		firstName : request.body.firstname,
		lastName : request.body.lastname,
		usesMetric : request.body.usesMetric,
		isVerified : false,
		favoriteRecipes : []
	};

  // Check if user name is already taken.
  try 
  {
		const db = await client.db(process.env.APP_DATABASE);
		
    const criteria = {
			username : newUser.username
		};

		const data = await db.collection(process.env.COLLECTION_USERS).findOne(criteria);
		
    if (data)
    {
      throw "User name unavailable";
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
    const db = await client.db(process.env.APP_DATABASE);
    db.collection(process.env.COLLECTION_USERS).insertOne(newUser);

		var result = await db.collection(process.env.COLLECTION_USERS).findOne(newUser);

		if (!result)
		{
			throw 'Could not create user account';
		}

		// assign data to the return package
		returnPackage.success = true;
		returnPackage.username = result.username;
		returnPackage.email = result.email;
		returnPackage.firstname = result.firstName;
		returnPackage.lastname = result.lastName;
		returnPackage.usesMetric = result.usesMetric;
		returnPackage.isVerified = result.isVerified;
  }
  catch(e)
  {
    returnPackage.error = e.toString();
    response.status(500).json(returnPackage);
    return;
	}
	
  response.status(200).json(returnPackage);
});


// Reset Password Endpoint
app.post('/api/resetPassword', async (request, response, next) =>
{
	/*
		Incoming:
		{
			username : string,
			password : string
		}

		Outgoing:
		{
			userID : string,
			success : bool,
			error : string
		}
	*/

  var returnPackage = {
		success : false,
		userID : '',
		error : ''
	};

  // Update user record. 
  try
  {
		const db = await client.db(process.env.APP_DATABASE);

		const searchUser = {
			username : request.body.username.toLowerCase()
		}

		const updatePackage = {
			$set : {
				password : request.body.password
			}
		}

		await db.collection(process.env.COLLECTION_USERS).updateOne(searchUser, updatePackage);

		var result = await db.collection(process.env.COLLECTION_USERS).findOne(searchUser);

		if (result)
		{
			returnPackage.userID = result._id;
		}
		else
		{
			returnPackage.error = 'User does not exist, please create account'
		}
  }
  catch(e)
  {
    returnPackage.error = e.toString();
    response.status(500).json(returnPackage);
    return;
	}

	returnPackage.success = true;
  response.status(200).json(returnPackage);
});

//////////////////////////////////////////////////////////////////////////////////
// Begin Internal Helper Functions
//////////////////////////////////////////////////////////////////////////////////

// Matches unit from imperial to metric
function fromImperialToMetric(incoming)
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
	if (incoming.unit == 'lb')
	{
		returnPackage.unit = 'kg';
	}

	// oz to g
	else if (incoming.unit == 'oz')
	{
		returnPackage.unit = 'g';
	}

	// fl-oz, cup, quart, tsp, tbsp to ml
	else if ((incoming.unit == 'fl-oz') ||
					 (incoming.unit == 'cup') ||
					 (incoming.unit == 'qt') ||
					 (incoming.unit == 'tsp') ||
					 (incoming.unit == 'tbsp'))
	{
		returnPackage.unit = 'ml';
	}

	// gallon to liter
	else if (incoming.unit == 'gal')
	{
		returnPackage.unit = 'l';
	}

	// farenheit to celsius
	else if (incoming.unit == 'f')
	{
		returnPackage.unit = 'c';
	}

	// Unit could not be converted
	else
	{
		returnPackage.error = 'Unit could not be compared.';
	}

	return returnPackage;
}

// Matches unit from metric to imperial
function fromMetricToImperial(incoming)
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
	if (incoming.unit == 'ml')
	{
		returnPackage.unit = 'tsp';
	}

	// l to gallons
	else if (incoming.unit == 'l')
	{
		returnPackage.unit = 'gal';
	}

	// g to oz
	else if (incoming.unit == 'g')
	{
		returnPackage.unit = 'oz';
	}

	// kg to lb
	else if (incoming.unit == 'kg')
	{
		returnPackage.unit = 'lb';
	}

	// c to f
	else if (incoming.unit == 'c')
	{
		returnPackage.unit = 'f';
	}

	// Unit could not be converted
	else
	{
		returnPackage.error = 'Unit could not be compared.';
	}

	return returnPackage;
}

// Processes string of ingredient names
async function processIngredients(incoming)
{
	/*
		incoming:
		{
			isMetric : bool,
			ingredients : array
		}

		Outgoing:
		{
			success : bool,
			databaseIngredients : array,
			frontendIngredients : array,
			error : string
		}
	*/

	// Offset values for input array of ingredients
	const IN_INGREDIENT_NAME_INDEX = 0;
	const IN_AMOUNT_INDEX = 1;
	const IN_UNIT_INDEX = 2;

	// Offset values for database ingredients array
	const DB_ID_INDEX = 0;
	const DB_AMOUNT_METRIC_INDEX = 1;
	const DB_METRIC_UNIT_INDEX = 2;
	const DB_AMOUNT_IMPERIAL_INDEX = 3;
	const DB_IMPERIAL_UNIT_INDEX = 4;

	// Offset values for frontend ingredients array
	const FE_ID_INDEX = 0;
	const FE_NAME_INDEX = 1;
	const FE_AMOUNT_METRIC_INDEX = 2;
	const FE_METRIC_UNIT_INDEX = 3;
	const FE_METRIC_UNIT_NAME_INDEX = 4;
	const FE_AMOUNT_IMPERIAL_INDEX = 5;
	const FE_IMPERIAL_UNIT_INDEX = 6;
	const FE_IMPERIAL_UNIT_NAME_INDEX = 7;

	var returnPackage = {
												success : true,
												databaseIngredients : [],
												frontendIngredients : [],
												error : ''
											};

	// iterate through all ingredients in array to do unit conversions and match IDs
	for (var i = 0; i < incoming.ingredients.length; i++)
	{
		// local arrays to be added to the ingredient arrays at the end of each iteration
		var dbIngredient = [];
		var feIngredient = [];

		// Locate ingredient in database
		{
			try
			{
				const db = await client.db(process.env.APP_DATABASE);

				const criteria = {
													 name : incoming.ingredients[i][IN_INGREDIENT_NAME_INDEX].toLowerCase()
												 };

				var result = await db.collection(process.env.COLLECTION_INGREDIENTS).findOne(criteria);

				// Add ingredient to the database if it doesn't exist
				if (!result)
				{
					try
					{
						await db.collection(process.env.COLLECTION_INGREDIENTS).insertOne(criteria);

						// Find the new ingredient to get it's info
						result = await db.collection(process.env.COLLECTION_INGREDIENTS).findOne(criteria);
					}
					catch (e)
					{
						returnPackage.error = e.toString();
						return;
					}
				}

				// Add the information from the ingredient to the local array
				dbIngredient[DB_ID_INDEX] = result._id;

				feIngredient[FE_ID_INDEX] = result._id;
				feIngredient[FE_NAME_INDEX] = result.name;
			}
			catch (e)
			{
				returnPackage.error = e.toString();
				return;
			}
		}

		// Perform the unit conversions and unit processing
		{
			var isMetric = incoming.isMetric;
			var amountMetric = 0.0;
			var amountImperial = 0.0;
			var metricUnit = '';
			var imperialUnit = '';
			var metricID = '';
			var imperialID = '';

			if (isMetric)
			{
				metricUnit = incoming.ingredients[i][IN_UNIT_INDEX];

				// match the unit to imperial
				imperialUnit = fromMetricToImperial({unit : metricUnit}).unit;

				// make sure the unit was matchable
				if (imperialUnit.length == 'Unit could not be compared.')
				{
					returnPackage.error = 'Bad Unit supplied';
					return;
				}

				// calculate the ammounts for each ingredient
				amountMetric = incoming.ingredients[i][IN_AMOUNT_INDEX];
				amountImperial = unitConversion(amountMetric).from(metricUnit).to(imperialUnit);
			}
			else
			{
				imperialUnit = incoming.ingredients[i][IN_UNIT_INDEX];

				// match the unit to metric
				metricUnit = fromImperialToMetric({unit : imperialUnit}).unit;

				// make sure the unit was matchable
				if (metricUnit.length > 'Unit could not be compared.')
				{
					returnPackage.error = 'Bad Unit supplied';
					return;
				}

				// calculate the amounts for each ingredient
				amountImperial = incoming.ingredients[i][IN_AMOUNT_INDEX];
				amountMetric = unitConversion(amountImperial).from(imperialUnit).to(metricUnit);
			}

			// Round the converted unit to two decimal places
			amountMetric = Number(amountMetric.toFixed(2));
			amountImperial = Number(amountImperial.toFixed(2));

			// get the IDs from the database
			try
			{
				const db = await client.db(process.env.APP_DATABASE);

				var metricResult = await db.collection(process.env.COLLECTION_METRIC_UNITS).findOne({unit : metricUnit});
				var imperialResult = await db.collection(process.env.COLLECTION_IMPERIAL_UNITS).findOne({unit : imperialUnit});

				metricID = ObjectID(metricResult._id);
				imperialID = ObjectID(imperialResult._id);
			}
			catch (e)
			{
				returnPackage.error = e.toString();
				return;
			}

			// Add data to the database ingredients array
			dbIngredient[DB_AMOUNT_METRIC_INDEX] = amountMetric;
			dbIngredient[DB_METRIC_UNIT_INDEX] = metricID;
			dbIngredient[DB_AMOUNT_IMPERIAL_INDEX] = amountImperial;
			dbIngredient[DB_IMPERIAL_UNIT_INDEX] = imperialID;

			// Add data to the frontend ingredients array
			feIngredient[FE_AMOUNT_METRIC_INDEX] = amountMetric;
			feIngredient[FE_METRIC_UNIT_INDEX] = metricID;
			feIngredient[FE_METRIC_UNIT_NAME_INDEX] = metricResult.unit;
			feIngredient[FE_AMOUNT_IMPERIAL_INDEX] = amountImperial;
			feIngredient[FE_IMPERIAL_UNIT_INDEX] = imperialID;
			feIngredient[FE_IMPERIAL_UNIT_NAME_INDEX] = imperialResult.unit;
		}

		// Add the processed ingredient to the array to be returned at end of function
		returnPackage.databaseIngredients[i] = dbIngredient;
		returnPackage.frontendIngredients[i] = feIngredient;
	}

	return returnPackage;
}

// Processes categories
async function processCategories(incoming)
{
	/*
		Incoming:
		{
			categories : array
		}

		outgoing:
		{
			databaseCategories : array,
			frontendCategories : array
		}
	*/

	const FE_CATEGORY_ID_INDEX = 0;
	const FE_CATEGORY_NAME_INDEX = 1;

	var returnPackage = {
												databaseCategories : [],
												frontendCategories : [],
												error : ''
											};

	// Process the categories of the recipe
	for (var i = 0; i < incoming.categories.length; i++)
	{
		// local array for the front-end categories in returnPackage
		var feCategory = [];

		// look for category in the database
		try
		{
			const db = await client.db(process.env.APP_DATABASE);

			const criteria = {
												 name : incoming.categories[i].toLowerCase()
											 };
			
			var result = await db.collection(process.env.COLLECTION_CATEGORIES).findOne(criteria);

			// Add data to the returnPackage arrays
			if (result)
			{
				returnPackage.databaseCategories.push(ObjectID(result._id));

				feCategory[FE_CATEGORY_ID_INDEX] = ObjectID(result._id);
				feCategory[FE_CATEGORY_NAME_INDEX] = result.name;

				returnPackage.frontendCategories.push(feCategory);
			}
		}
		catch (e)
		{
			returnPackage.error = e.toString();
			return;
		}
	}
	
	return returnPackage;
}


app.listen(process.env.PORT || 5000); // start Node + Expresponses server on port 5000
