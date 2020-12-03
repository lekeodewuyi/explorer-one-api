const functions = require('firebase-functions');

const express = require('express');
const app = express();

const cors = require('cors')

const { searchForTweet, getTweetById, saveFavoriteTweet, deleteFavoriteTweet, getAllFavoriteTweets, timeTravel, createCollection, getTweetsFromCollection, getPlaceId } = require('./handlers/twitter');

const { signup, login, resetPassword } = require('./handlers/users');
const { auth } = require('./utilities/auth');
const { getUserDetail } = require('./handlers/test');

const whitelist = ['https://twtr.lekeodewuyi.com', 'https://twtr-dev-env.netlify.app']
const corsOption = {
    origin: whitelist,
    optionsSuccessStatus: 200
}
app.all('/*', function(req, res, next) {
    for (let i = 0; i < whitelist.length; i++) {
      if (req.headers.referer.indexOf(whitelist[i]) > -1) {
        console.log(whitelist[i]);
        return next()
      }
    }
    console.log("no")
    return res.status(400).json({error: 'Invalid Request'})
  });
app.use(cors(corsOption));



app.post('/', function(req, res){
    res.send("Hello World!")
});
app.post('/search', searchForTweet);
app.post('/get/:tweetId', getTweetById);
app.post('/addfavorite/:tweetId', auth ,saveFavoriteTweet);
app.post('/deletefavorite/:tweetId', auth, deleteFavoriteTweet);
app.post('/getfavorites', auth, getAllFavoriteTweets);
app.post('/collection', auth, getTweetsFromCollection);
app.post('/timetravel', timeTravel);
app.post('/collection/create', auth, createCollection);
app.post('/geo', getPlaceId)

app.post('/signup', signup);
app.post('/login', login);
app.post('/user', getUserDetail)
app.post('/update/password', resetPassword)


exports.api = functions.https.onRequest(app);