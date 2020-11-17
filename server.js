// Program dependencies
const bodyParser = require('body-parser');
const unitConversion = require('convert-units');
const cors = require('cors');
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


// Converts units between mesurement systems
app.post('/convertUnit', async (request, response, next) => {
	/*
		Incoming:
		{
			isMetric : boolean,
			unit : string,
			value : integer
		}

		Outgoing:
		{
			success : bool,
			value : integer,
			unit : string,
			unitID : string,
			error : string
		}
	*/

	var returnPackage = {
												value : 0,
												unit : '',
												unitID : '',
												error : ''
											};

	var params = {
									unit : request.body.unit
								};

	var answer;
	var collection;

	// match the unit to the other system's units
	if (request.body.isMetric)
	{
		answer = fromMetricToImperial(params);
		collection = process.env.COLLECTION_IMPERIAL_UNITS;
	}
	else
	{
		answer = fromImperialToMetric(params);
		collection = process.env.COLLECTION_METRIC_UNITS;
	}

	// Exit if bad unit was given
	if (answer.error != '')
	{
		returnPackage.error = 'Bad unit given.';
		response.status(400).json(returnPackage);
		return;
	}

	returnPackage.unit = answer.unit;
	returnPackage.value = unitConversion(request.body.value).from(request.body.unit).to(answer.unit);

	// Find the unit in the database to return the _id field
	try
	{
		const db = await client.db(process.env.APP_DATABASE);

		const criteria = {
											 unit : answer.unit
										 };

		var result = await db.collection(collection).findOne(criteria);

		returnPackage.unitID = result._id;
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		response.status(500).json(returnPackage);
		return;
	}

	response.status(200).json(returnPackage);
});


// Create new recipe endpoint. 
app.post('/createRecipe', async (request, response, next) =>
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

	console.log(newRecipe);

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
};

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
};

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

	var databaseIngredients = [];
	var frontendIngredients = [];

	// Offset values for input array of ingredients
	const IN_INGREDIENT_NAME_INDEX = 0;
	const IN_AMOUNT_METRIC_INDEX = 1;
	const IN_UNIT_METRIC_INDEX = 2;
	const IN_AMOUNT_IMPERIAL_INDEX = 3;
	const IN_UNIT_IMPERIAL_INDEX = 4;

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
				metricUnit = incoming.ingredients[i][IN_UNIT_METRIC_INDEX];

				// match the unit to imperial
				imperialUnit = fromMetricToImperial({unit : metricUnit}).unit;

				// make sure the unit was matchable
				if (imperialUnit.length == 'Unit could not be compared.')
				{
					returnPackage.error = 'Bad Unit supplied';
					return;
				}

				// calculate the ammounts for each ingredient
				amountMetric = incoming.ingredients[i][IN_AMOUNT_METRIC_INDEX];
				amountImperial = unitConversion(amountMetric).from(metricUnit).to(imperialUnit);
			}
			else
			{
				imperialUnit = incoming.ingredients[i][IN_UNIT_IMPERIAL_INDEX];

				// match the unit to metric
				metricUnit = fromImperialToMetric({unit : imperialUnit}).unit;

				// make sure the unit was matchable
				if (metricUnit.length > 'Unit could not be compared.')
				{
					returnPackage.error = 'Bad Unit supplied';
					return;
				}

				// calculate the amounts for each ingredient
				amountImperial = incoming.ingredients[i][IN_AMOUNT_IMPERIAL_INDEX];
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


app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
