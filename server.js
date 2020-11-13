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

app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
