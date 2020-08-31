const functions = require('firebase-functions');

const express = require('express');
const app = express();

const { sea, searchForTweet } = require('./handlers/twitter');

app.post('/gettweet', searchForTweet)


exports.api = functions.https.onRequest(app);