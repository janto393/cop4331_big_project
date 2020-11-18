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


// edit favorite recipes Endpoint
app.post('/editFavoriteRecipes', async (request, response, next) =>
{
  // incoming: _id, favoriteRecipes (_ids' of recipes are inserted as strings and api endpoint converts into objectid)
  // outgoing: _id, success, error
  // JSON package example 
//   {
// 	"_id": "5fa613c408e77205a8e4aebe",
// 	"favoriteRecipes": [
// 	  "5fb48f7dff9d47012c545228"
// 	]
//   }

  var searchUser = {
					_id : objectID(request.body._id),
  };
  const INVALID_USER = -1;
  var result = null;

  var returnPackage = {
                        _id : INVALID_USER,
						success : false,
						error : ''
                      };

  
	var i;
	var fave = [];
	for (i = 0; i < request.body.favoriteRecipes.length; i++)
	{
		fave.push(objectID(request.body.favoriteRecipes[i]));
		
	}

	var updateUser = { $set:{
								favoriteRecipes : fave
	}};
	
  // Update user record. 
  try
  {
    const db = client.db(process.env.APP_DATABASE);
		await db.collection(process.env.COLLECTION_USERS).updateOne(searchUser, updateUser);
		var result = await db.collection(process.env.COLLECTION_USERS).findOne(searchUser);
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
    returnPackage._id = result._id;
    returnPackage.success = true;
	}

  response.status(200).json(returnPackage);
});
app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
