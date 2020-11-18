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


// delete recipe endpoint
app.post('/deleteRecipe', async (request, response, next) =>
{
  // incoming: recipeID
  // outgoing: success, error
  // JSON package exmaple
  // {
  //   "_id": "5fb332c66176de0b60a35c69"
  // }

  var searchUser = {
					_id : ObjectID(request.body._id)
  };
  var result = null;

  var returnPackage = {
						success : false,
						error : ''
					  };
					  
					  

  // Delete recipe record. 
  try
  {
    const db = client.db(process.env.APP_DATABASE);
	await db.collection(process.env.COLLECTION_RECIPES).deleteOne(searchUser);
	var result = await db.collection(process.env.COLLECTION_RECIPES).findOne(searchUser);
  }
  catch(e)
  {
    returnPackage.error = e.toString();
    response.status(500).json(returnPackage);
    return;
  }
  
  console.log( result);
  // Assigns return package values. 
  if (!result)
  {
    
    returnPackage.success = true;
    // console.log(returnPackage.success);
	}

  response.status(200).json(returnPackage);
});

app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
