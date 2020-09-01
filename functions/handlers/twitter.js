const { db, admin, T } = require('../utilities/admin');

const _ = require('lodash');
const { user } = require('firebase-functions/lib/providers/auth');

const reducerArray = [
    'id_str',
    'created_at',
    'full_text',
    'text',
    'user["screen_name"]',
    'user["name"]',
    'user["id_str"]',
    'user["profile_image_url"]',
    'in_reply_to_status_id_str',
    'possibly_sensitive',
    'retweet_count',
    'favorite_count',
    'lang',
    'retweeted_status["text"]',
    'retweeted_status["full_text"]',
    'is_quote_status',
    'extended_entities["media"]'
]

exports.searchForTweet = (req, res) => {
    const params = {
        tweet_mode: "extended",
        q: req.body.query,
        count: req.body.count,
        result_type: req.body.result_type,
        lang: req.body.language,
        geo: "england"
    }
    let results = []
    T.get('search/tweets/', params, function(err, data, response) {
        if(!err){
            results = data.statuses;
            for (let i = 0; i < results.length; i++) {
                results[i] = _.pick(results[i], reducerArray)
            }
            return res.json({results})
        } else {
            return res.status(400).json({err})
        }
    })
}

exports.getTweetById = (req, res) => {
        const params = {
            id: req.params.tweetId
        }

        T.get('statuses/show/', params, function(err, data, response) {
            if(!err){
                data = _.pick(data, reducerArray)
                return res.json({data})
            } else {
                return res.status(400).json({err})
            }
            })
}


exports.saveFavoriteTweet = async (req, res) => {

    const tweetId = req.params.tweetId;
    const user = db.collection("users").doc(`${email}`);

    await user.update({
        favorites: admin.firestore.FieldValue.arrayUnion(tweetId)
    });

    let userDetails = {};
    return db.doc(`users/${email}`).get()
        .then((doc) => {
            if(!doc.exists) {
                return res.status(400).json({error: "Sorry, this user does not exist"})
            }
            userDetails = doc.data();
            return res.json({userDetails});
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Something went wrong"})
        })
}


exports.deleteFavoriteTweet = async (req, res) => {

    const tweetId = req.params.tweetId;
    const user = db.collection("users").doc(`${email}`);

    await user.update({
        favorites: admin.firestore.FieldValue.arrayRemove(tweetId)
    });
    let userDetails = {};
    return db.doc(`users/${email}`).get()
        .then((doc) => {
            if(!doc.exists) {
                return res.status(400).json({error: "Sorry, this user does not exist"})
            }
            userDetails = doc.data();
            return res.json({userDetails});
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Something went wrong"})
        })
}


exports.getFavoriteTweets = (req, res) => {

    let favorites = [];
    let results = [];
    db.doc(`users/${email}`).get()
        .then( async (doc) => {
            if(!doc.exists) {
                return res.status(400).json({error: "Sorry, this user does not exist"})
            }
            favorites = doc.data().favorites;
            let length = favorites.length;
            let favoritesIds = favorites.toString();

            const params = {
                id: favoritesIds
            }

            return T.get(`statuses/lookup`, params, function (err, data, response) {
                if(!err){
                        for (let i = 0; i < data.length; i++) {
                            data[i] = _.pick(data[i], reducerArray)
                        }
                        results = data;
                        return res.json({length, results})
                } else {
                    return res.status(400).json({err})
                }
            })

        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Something went wrong"})
        })
}



exports.timeTravel = (req, res) => {
    const params = {
        screen_name: req.body.screen_name
    }

    return T.get(`statuses/user_timeline`, params, function (err, data, response) {
        if(!err){
                for (let i = 0; i < data.length; i++) {
                    data[i] = _.pick(data[i], reducerArray)
                }
                results = data;
                return res.json({results})
        } else {
            return res.status(400).json({err})
        }
    })
}




exports.createCollection = async (req, res) => {

    const collectionName = req.body.collectionName;

    const newCollection = {
        email: email,
        [collectionName]: [],
        collectionName: req.body.collectionName,
        createdAt: new Date().toISOString()
    }

    let collectionCount;
    let collectionDetails = {};
    db.doc(`users/${email}`).get()
        .then((doc) => {
            collectionCount = doc.data().collectionCount;
            if (collectionCount < 20) {
                return db.collection(`${email}-(Collections)`).where("collectionName", "==", collectionName).get();
            } else {
                return res.status(400).json({error: "You have exceeded your collection limit"})
            }
        })
        .then( async (data) => {
            let collections = [];
            data.forEach((doc) => {
                collections.push(doc.data());
            })
            if (!Array.isArray(collections) || !collections.length) { // collection does not exist
                await db.doc(`users/${email}`).update({collectionCount: collectionCount + 1})
                return db.doc(`${email}-(Collections)/${newCollection.collectionName}`).set(newCollection);
            } else {
                return res.status(400).json({error: "You already have a collection with this name"})
            }
        })
        .then(() => {
            collectionDetails = newCollection;
            return res.json({collectionDetails})
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Something went wrong"})
        })

}