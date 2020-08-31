const functions = require('firebase-functions');

const express = require('express');
const app = express();

const { searchForTweet, getTweetById, saveFavoriteTweet } = require('./handlers/twitter');
const { signup, login } = require('./handlers/users');
const { auth } = require('./utilities/auth');

app.post('/search', searchForTweet);
app.post('/search/id', getTweetById);
app.post('/addfavorite/:tweetId', auth ,saveFavoriteTweet);

app.post('/signup', signup);
app.post('/login', login);


exports.api = functions.https.onRequest(app);