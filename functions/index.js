const functions = require('firebase-functions');

const express = require('express');
const app = express();

const { searchForTweet, getTweetById } = require('./handlers/twitter');
const { signup, login } = require('./handlers/users');

app.post('/search', searchForTweet);
app.post('/search/id', getTweetById);

app.post('/signup', signup)
app.post('/login', login)


exports.api = functions.https.onRequest(app);