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

// update user Endpoint
app.post('/updateUser', async (request, response, next) =>
{
  // incoming: userId, username, firstName, lastName, profilePicture
  // outgoing: userID, success
	
  const { 
          userID, 
          username,
          password,
					firstName,
					lastName,
					// profilePicture
				} = request.body;

  const INVALID_USER = -1;
  var result = null;
  var success;

  var searchUser = {
                      userID : userID
                  };
  var returnPackage = {
                        userID : INVALID_USER,
                        success : false
                      };

  const updateUser = { $set:{
                      username : username,
                      password: password,
                      firstName : firstName,
                      lastName : lastName,
                      // profilePicture : profilePicture,
                  }};

  // Update user record. 
  try
  {
    const db = client.db(process.env.APP_DATABASE);
    var result = await db.collection(process.env.COLLECTION_USERS).updateOne(searchUser, updateUser);
    
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
    returnPackage.userID = result.userID;
    success = true;
    returnPackage.success = success;
  }
  response.status(200).json(returnPackage);
});

app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
