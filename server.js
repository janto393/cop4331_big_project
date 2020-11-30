// Program dependencies
const bodyParser = require('body-parser');
const unitConversion = require('convert-units');
const { metric } = require('convert-units/lib/definitions/length');
const cors = require('cors');
const { response, request } = require('express');
require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const path = require('path');

// JWT utilities
const JWT = require('njwt');

// New SendGrid resources
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Deployment setup
const BASE_URI = 'https://brownie-points-4331-6.herokuapp.com/';

const app = express();
app.use(cors());
app.use(bodyParser.json());


// Environment variables
const PORT = process.env.PORT || 5000;
app.set('port', PORT);
const url = process.env.MONGODB_URI;

// Initialize database object and connect
const client = new MongoClient(url, { useUnifiedTopology: true });
client.connect();

// Server static assets if in production
if (process.env.NODE_ENV === 'production') 
{
  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => 
	{
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

///////////////////////////////////////////////////
// For Heroku deployment
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

///////////////////////////////////////////////////
// For Heroku deployment
app.get('*', (req, res) => 
{
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'))
});

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
app.post(BASE_URI + '/api/createRecipe', async (request, response, next) =>
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
			instructions : array,
			error : string
		}
	*/

	var returnPackage = {
		recipeID : '',
		categories : [],
		ingredients : [],
		instructions : [],
		error : ''
	};

	var ingredientPayload = {
		isMetric : request.body.isMetric,
		ingredients : request.body.ingredients
	};

	var categoriesPayload = {
		categories : request.body.categories
	};

	var instructionsPayload = {
		instructions : request.body.instructions
	};

	try
	{
		var processedInstructions = await processInstructions(instructionsPayload);
		var processedIngredients = await processIngredients(ingredientPayload);
		var processedCategories = await processCategories(categoriesPayload);
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
		response.status(500).json(encryptedPackage.compact());
		return;
	}

	// create json of new recipe to be inserted into database
	var newRecipe = {
		picture : request.body.picture,
		publicRecipe : request.body.publicRecipe,
		title : request.body.title.toLowerCase(),
		author : ObjectID(request.body.author),
		instructions : processedInstructions.instructions,
		categories : processedCategories.databaseCategories,
		ingredients : processedIngredients.ingredients
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
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
		response.status(500).json(encryptedPackage.compact());
		return;
	}

	// Assign values to the return package
	returnPackage.categories = processedCategories.frontendCategories;
	returnPackage.ingredients = processedIngredients.ingredients;
	returnPackage.instructions = processedInstructions.instructions;

	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
  response.status(200).json(encryptedPackage.compact());
});


// delete recipe endpoint
app.post(BASE_URI + '/api/deleteRecipe', async (request, response, next) =>
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
			returnPackage.error = 'Unable to delete recipe'
		}
  }
  catch (e)
  {
		returnPackage.error = e.toString();
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
    response.status(500).json(encryptedPackage.compact());
    return;
	}

	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
  response.status(200).json(encryptedPackage.compact());
});


// Fetch recipe by id
app.post(BASE_URI + '/api/fetchRecipeByID', async (request, response, next) => {
	/*
		Incoming:
		{
			recipeID : string
		}

		Outgoing:
		{
			success : boolean,
			recipeID : string,
			picture : string, // URI to picture in aws bucket
			publicRecipe : boolean,
			title : string,
			author : JSON object,
			instructions : array,
			categories : JSON object,
			ingredients : array,
			error : string
		}

		author JSON object:
		{
			userID : string,
			name : string
		}

		categories JSON object:
		{
			categoryID : string,
			name : string
		}
	*/

	var returnPackage = {
		success : false,
		recipeID : '',
		picture : '',
		publicRecipe : false,
		title : '',
		author : '',
		instructions : [],
		categories : [],
		ingredients : [],
		error : ''
	};

	var categories = [];
	var author = '';

	// fetch the recipe record from the database
	try
	{
		const db = await client.db(process.env.APP_DATABASE);

		let criteria = {
			_id : ObjectID(request.body.recipeID)
		};

		let result = await db.collection(process.env.COLLECTION_RECIPES).findOne(criteria);

		if (!result)
		{
			throw 'Recipe ID invalid';
		}

		// Assign record data to the return package and local variables for processing
		returnPackage.recipeID = result._id;
		returnPackage.picture = result.picture;
		returnPackage.publicRecipe = result.publicRecipe;
		returnPackage.title = result.title;
		returnPackage.instructions = result.instructions;
		returnPackage.ingredients = result.ingredients;
		categories = result.categories;
		author = result.author;

		// configure criteria package for user collection
		criteria = {
			_id : ObjectID(author)
		};

		// search for the author in the database
		result = await db.collection(process.env.COLLECTION_USERS).findOne(criteria);

		let authorObject = {
			userID : '',
			name : ''
		};

		if (!result)
		{
			authorObject.userID = '';
			authorObject.name = '[User unavailable]';
		}
		else
		{
			authorObject.userID = result._id;
			authorObject.name = (result.firstName + ' ' + result.lastName);
		}

		// assign the author package to the return package
		returnPackage.author = authorObject;

		// search for each category in the categories collection to get the name
		for (let i = 0; i < categories.length; i++)
		{
			// configure criteria package for the criteria collection
			criteria = {
				_id : ObjectID(categories[i])
			};

			// search for the category in the database
			result = await db.collection(process.env.COLLECTION_CATEGORIES).findOne(criteria);

			if (!result)
			{
				throw 'invalid category detected';
			}

			let processedCategory = {
				categoryID : result._id,
				name : result.name
			};

			returnPackage.categories.push(processedCategory);
		}
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
		response.status(400).json(encryptedPackage.compact());
		return;
	}

	returnPackage.success = true;
	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
	response.status(200).json(encryptedPackage.compact());
});


// Fetches recipes according to title
app.post(BASE_URI + '/api/fetchRecipes', async (request, response, next) => {
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
	var criteria = {};

	var andConditions = [];

	// process title
	if ((request.body.title != null) && (typeof request.body.title == 'string'))
	{
		let titleCriteria = {
			title : {
				$regex : '^' + request.body.title.toLowerCase(),
				$options : 'i'
			}
		};

		andConditions.push(titleCriteria);
	}

	// process category
	if ((request.body.category != null) && (typeof request.body.category == 'string'))
	{
		// package the category given into format for the helper function
		const rawCategory = {
			name : request.body.category.toLowerCase()
		};

		try
		{
			const db = client.db(process.env.APP_DATABASE);

			let processedCategory = await db.collection(process.env.COLLECTION_CATEGORIES).findOne(rawCategory);

			if (processedCategory)
			{
				let categoryCriteria = {
					categories : ObjectID(processedCategory._id)
				};

				andConditions.push(categoryCriteria);
			}
		}
		catch (e)
		{
			returnPackage.error = e.toString();
			const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
			response.status(400).json(encryptedPackage.compact());
			return;
		}
	}

	// process if we are fetching user recipes only
	if (request.body.fetchUserRecipes)
	{
		let authorCriteria = {
			author : ObjectID(request.body.userID)
		};

		andConditions.push(authorCriteria);
	}

	// Add AND conditions to criteria if criteria was specified
	if (andConditions.length > 0)
	{
		criteria.$and = andConditions;
	}

	// Query the database based on criteria supplied
	try
	{
		const db = await client.db(process.env.APP_DATABASE);

		var result = await db.collection(process.env.COLLECTION_RECIPES).find(criteria).skip(Math.floor(skipOffset)).limit(Math.floor(pageCapacity)).toArray();

		returnPackage.recipes = result;

		// get the count of total recipes that matched the criteria so front-end can figure out how many pages to display
		returnPackage.totalNumRecipes = await db.collection(process.env.COLLECTION_RECIPES).find(criteria).count();
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
		response.status(500).json(encryptedPackage.compact());
		return;
	}

	// Update the numeric indexes for the return package
	returnPackage.numInPage = returnPackage.recipes.length;

	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
	response.status(200).json(encryptedPackage.compact());
});


// login endpoint
app.post(BASE_URI + '/api/login', async (request, response, next) => 
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
			error : string
		}
	*/

	const INVALID_CREDENTIALS_MSG = 'Invalid Username/Password';
	const NOT_VERIFIED_MSG = 'Please verify your email before logging in';

	var returnPackage = {
		success : false,
		userID : '',
		username : '',
		email : '',
		firstname : '',
		lastname : '',
		usesMetric : false,
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
			returnPackage.error = INVALID_CREDENTIALS_MSG;
			
			// encrypt the return package with a jwt
			const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
			response.status(400).json(encryptedPackage.compact());
			return;
		}

		// check if user is not verified
		if (!result.isVerified)
		{
			returnPackage.error = NOT_VERIFIED_MSG;

			// encrypt the return package with a jwt
			const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
			response.status(400).json(encryptedPackage.compact());
			return;
		}

		// parse the user information into the return package
		returnPackage.userID = result._id;
		returnPackage.username = result.username;
		returnPackage.email = result.email;
		returnPackage.firstname = result.firstName;
		returnPackage.lastname = result.lastName;
		returnPackage.usesMetric = result.usesMetric;
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		
		// encrypt the return package with a jwt
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
		response.status(500).json(encryptedPackage.compact());
		return;
	}

	returnPackage.success = true;

	// encrypt the return package with a jwt
	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
	response.status(200).json(encryptedPackage.compact());
});


// Modify Recipe Endpoint
app.post(BASE_URI + '/api/modifyRecipe', async (request, response, next) =>
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
			const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
			response.status(400).json(encryptedPackage.compact());
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
			const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
			response.status(400).json(encryptedPackage.compact());
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

			// Find the recipe to return the ID
			var result = await db.collection(process.env.COLLECTION_RECIPES).findOne(criteria);

			if (result)
			{
				returnPackage.recipeID = result._id;
			}
		}
		catch (e)
		{
			returnPackage.error = e.toString();
			const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
			response.status(500).json(encryptedPackage.compact());
			return;
		}
	}

	returnPackage.success = true;
	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
	response.status(200).json(encryptedPackage.compact());
});


// Register Endpoint
app.post(BASE_URI + '/api/registerUser', async (request, response, next) =>
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
		email : request.body.email.toLowerCase(),
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
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
    response.status(400).json(encryptedPackage.compact());
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
		var id = (result._id).toString();;
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
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
    response.status(500).json(encryptedPackage.compact());
    return;
	}
	
	// Send the email to the user for verification
	const msg = {
		to: returnPackage.email, // Change to your recipient
		from: 'browniepoints12345@gmail.com', // Change to your verified sender
		subject: 'Welcome to Brownie Points!!',
		html: '<div>'+
						'<div style="width: 60%; margin: auto; text-align: center; padding: 3%; border: 3px solid black; border-radius: 10%; margin: 0; position: absolute; top: 50%; left: 50%; -ms-transform: translate(-50%, -50%); transform: translate(-50%, -50%); background-color: rgb(177, 28, 28);">'+
							'<h1 style="color:rgb(247, 240, 240); font-family: Courier New; text-align:center; font-size: 50px;">Welcome to Brownie Points!</h1>'+
							'<br />'+
							'<br />'+
							'<p style="color:rgb(255, 255, 255); font-family: Courier New; text-align: center; font-size: 25px;">Thank you for choosing Brownie Points to keep track all you delicious recipes! We provide the most efficent and appetizing way to create, view, update and delete your mouthwatering masterpieces on your phone.</p>'+
							'<p style="color:rgb(255, 255, 255); font-family: Courier New; font-weight: bold; text-align: center; font-size: 25px;">In order to login into your account you must verify your email address by clicking the button at the end of this email.</p>'+
							'<br />'+
							'<br />'+
							'<a style="color:rgb(2, 6, 10); font-family: Courier New; font-weight: bold; text-align: center; font-size: 25px;" href="http://localhost:3000/verify?id=id/" target="_blank">Click Here to Verify Email!</a>'+
						'</div>'+
					'</div>'
	}

	try
	{
		sgMail
			.send(msg)
			.then()
			.catch((error) => {returnPackage.error = error.toString()});
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
		response.status(400).json(encryptedPackage.compact());
		return;
	}
	
	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
  response.status(200).json(encryptedPackage.compact());
});


// Reset Password Endpoint
app.post(BASE_URI + '/api/resetPassword', async (request, response, next) =>
{
	/*
		Incoming:
		{
			username : string,
			email : string,
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
			username : request.body.username.toLowerCase(),
			email : request.body.email.toLowerCase()
		}

		const updatePackage = {
			$set : {
				password : request.body.password
			}
		}

		// see if the user is even in the database
		var result = await db.collection(process.env.COLLECTION_USERS).findOne(searchUser);

		if (!result)
		{
			returnPackage.error = 'Account does not exist. Please create an account.';
			const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
			response.status(404).json(encryptedPackage.compact());
			return;
		}

		await db.collection(process.env.COLLECTION_USERS).updateOne(searchUser, updatePackage);

		result = await db.collection(process.env.COLLECTION_USERS).findOne(searchUser);

		if (result)
		{
			returnPackage.userID = result._id;
		}
		else
		{
			returnPackage.error = 'Credentials invalid'
			const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
			response.status(404).json(encryptedPackage.compact());
			return;
		}
  }
  catch(e)
  {
		returnPackage.error = e.toString();
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
    response.status(500).json(encryptedPackage.compact());
    return;
	}

	returnPackage.error = 'Password Reset';
	returnPackage.success = true;
	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
  response.status(200).json(encryptedPackage.compact());
});


// Update user information
app.post(BASE_URI + '/api/updateUserInfo', async (request, response, next) =>
{
	/*
		Incoming:
		{
			userID : string,
			newInfo : json package
		}

		Outgoing:
		{
			success : bool,
			error : string
		}
	*/ 
	var returnPackage = {
		success : false,
		error : ''
	}

	const criteria = {
		_id : ObjectID(request.body.userID)
	}

	const updatePackage = {
		$set : request.body.newInfo
	}

	try 
	{
		const db = await client.db(process.env.APP_DATABASE);

		await db.collection(process.env.COLLECTION_USERS).updateOne(criteria, updatePackage);
	}
	catch (e)
	{
		returnPackage.error = e.toString();
		const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
		response.status(500).json(encryptedPackage.compact());
		return;
	}

	returnPackage.success = true;
	const encryptedPackage = JWT.create(returnPackage, process.env.JWT_KEY);
	response.status(200).json(encryptedPackage.compact());
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
			ingredients : array of json objects
		}

		Outgoing:
		{
			success : bool,
			databaseIngredients : array,
			frontendIngredients : array,
			error : string
		}
	*/

	// Offset values for processed ingredients array
	const PI_NAME_INDEX = 0;
	const PI_AMOUNT_METRIC_INDEX = 1;
	const PI_METRIC_UNIT_INDEX = 2;
	const PI_AMOUNT_IMPERIAL_INDEX = 3;
	const PI_IMPERIAL_UNIT_INDEX = 4;

	var returnPackage = {
		success : false,
		ingredients : [],
		error : ''
	};

	// Iterate through all ingredients in array to do unit conversions
	for (var i = 0; i < incoming.ingredients.length; i++)
	{
		// empty array to store the processed information for each ingredient
		var ingredient = [];

		// Store the name of the ingredient
		ingredient[PI_NAME_INDEX] = incoming.ingredients[i].ingredient;

		// Perform the unit conversions and unit processing (block to limit scope of variables)
		{
			var isMetric = incoming.isMetric;
			var amountMetric = 0.0;
			var amountImperial = 0.0;
			var metricUnit = '';
			var imperialUnit = '';

			if (isMetric)
			{
				metricUnit = incoming.ingredients[i].unit;

				// match the unit to imperial
				imperialUnit = fromMetricToImperial({unit : metricUnit}).unit;

				// make sure the unit was matchable
				if (imperialUnit.length == 'Unit could not be compared.')
				{
					returnPackage.error = 'Bad Unit supplied';
					return;
				}

				// calculate the ammounts for each ingredient
				amountMetric = Number(incoming.ingredients[i].quantity);
				amountImperial = unitConversion(amountMetric).from(metricUnit).to(imperialUnit);
			}
			else
			{
				imperialUnit = incoming.ingredients[i].unit;

				// match the unit to metric
				metricUnit = fromImperialToMetric({unit : imperialUnit}).unit;

				// make sure the unit was matchable
				if (metricUnit.length > 'Unit could not be compared.')
				{
					returnPackage.error = 'Bad Unit supplied';
					return;
				}

				// calculate the amounts for each ingredient
				amountImperial = Number(incoming.ingredients[i].quantity);
				amountMetric = unitConversion(amountImperial).from(imperialUnit).to(metricUnit);
			}

			// Round the converted unit to two decimal places
			amountMetric = Number(amountMetric.toFixed(2));
			amountImperial = Number(amountImperial.toFixed(2));

			// Add the data to the array of the processed ingredient
			ingredient[PI_AMOUNT_METRIC_INDEX] = amountMetric;
			ingredient[PI_METRIC_UNIT_INDEX] = metricUnit;
			ingredient[PI_AMOUNT_IMPERIAL_INDEX] = amountImperial;
			ingredient[PI_IMPERIAL_UNIT_INDEX] = imperialUnit;
		}

		// Add the processed ingredient to the return package
		returnPackage.ingredients[i] = ingredient;
	}

	returnPackage.success = true;
	return returnPackage;
}

async function processInstructions(incoming)
{
	/*
		Incoming:
		{
			instructions : array of JSON objects
		}

		Outgoing:
		{
			instructions : array of sub-arrays of strings
		}
	*/

	var returnPackage = {
		instructions : []
	}

	// extract the instructions out of the sub-json objects
	for (var i = 0; i < incoming.instructions.length; i++)
	{
		returnPackage.instructions.push(incoming.instructions[i].instruction);
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

app.listen(PORT, () => {
	console.log('Server Listening on port ' + PORT);
});
