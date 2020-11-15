// Program dependencies
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const expresponses = require('express');
const MongoClient = require('mongodb').MongoClient;
const objectID = require('mongodb').ObjectID;
const path = require('path');

const app = expresponses();
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

// Login endpoint. 
app.post('/login', async (request, response, next) => 
{
  // incoming: username, password
  // outgoing: userID, username, email, firstName, lastName, profilePicture
  // isVerified, favoriteRecipes, error

 const { username, password } = request.body;

 const INVALID_USER = -1;
 var returnPackage = {
                      userID : INVALID_USER,
                      username : '',
                      email : '',
                      firstName : '',
                      lastName : '',
                      // profilePicture : profilePicture,
                      isVerified : false,
                      favoriteRecipes : [],
                      error : ''
};

 try 
  {
		const db = client.db(process.env.APP_DATABASE);
		
    const criteria = {
                      username:username, 
                      password:password
                      };
		var result = await db.collection(process.env.COLLECTION_USERS).findOne(criteria);
  }
  catch(e)
  {
    returnPackage.error = e.toString();
    response.status(400).json(returnPackage);
    return;
  }

 console.log(result);
 if( result )
	{
    returnPackage.userID = result.userID;
    returnPackage.username = result.username;
		returnPackage.email = result.email;
		returnPackage.firstName = result.firstName;
		returnPackage.lastName = result.lastName;
		// returnPackage.profilePicture = result.profilePicture;
		returnPackage.isVerified = result.isVerified;
		returnPackage.favoriteRecipes = result.favoriteRecipes;
	}

  response.status(200).json(returnPackage);
});

app.listen(process.env.PORT || 5000); // start Node + Expresponses server on port 5000
