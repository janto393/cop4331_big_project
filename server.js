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

// login endpoint
app.post('/login', async (req, res, next) => 
{
  // incoming: username, password
  // outgoing: userID, username, email, firstName, lastName, profilePicture
  // isVerified, favoriteRecipes, error

 var error = '';
 const { username, password } = req.body;
 const db = client.db();
 // IDK name of db for users.
 const results = await db.collection('Users').find({username:username, password:password}).toArray();
 var userID = -1;
 var email = '';
 var firstName = '';
 var lastName = '';
 var profilePicture = ''; // Does picture get stored in database as a string?
 var isVerified = false;
 var favoriteRecipes = null;
 
 if( results.length > 0 )
	{
		userID = results[0].userID;
		username = results[0].username;
		email = results[0].email;
		firstName = results[0].firstName;
		lastName = results[0].lastName;
		profilePicture = results[0].profilePicture;
		isVerified = results[0].isVerified;
		favoriteRecipes = results[0].favoriteRecipes;
	}

  var ret = {
							userID : userID,
							username : username,
							email : email,
							firstName : firstName,
							lastName:lastName,
							profilePicture : profilePicture,
							isVerified : isVerified,
							favoriteRecipes : favoriteRecipes,
							error : ''
						};

  res.status(200);
  res.json(ret);
});

app.listen(5000); // start Node + Express server on port 5000
