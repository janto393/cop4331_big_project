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

app.listen(process.env.PORT || 5000); // start Node + Express server on port 5000
