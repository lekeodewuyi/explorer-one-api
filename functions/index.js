const functions = require('firebase-functions');

const express = require('express');
const app = express();

const cors = require('cors')
// app.use(cors());

const corsOption = {
    origin: 'https://twtr.lekeodewuyi.com',
    optionsSuccessStatus: 200
}
const referrer_domain = "https://twtr.lekeodewuyi.com"
//check for the referrer domain


const { searchForTweet, getTweetById, saveFavoriteTweet, deleteFavoriteTweet, getAllFavoriteTweets, timeTravel, createCollection, getTweetsFromCollection, getPlaceId } = require('./handlers/twitter');

const { signup, login, resetPassword } = require('./handlers/users');
const { auth } = require('./utilities/auth');
const { getUserDetail } = require('./handlers/test');


app.all('/*', function(req, res, next) {
    if(req.headers.referer.indexOf(referrer_domain) == -1){
        console.log("no")
      res.send('Invalid Request')
    }
    next();
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