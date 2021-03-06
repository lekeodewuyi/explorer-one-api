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
    'user["profile_image_url_https"]',
    'user["verified"]',
    'in_reply_to_status_id_str',
    'in_reply_to_screen_name',
    'possibly_sensitive',
    'retweet_count',
    'favorite_count',
    'lang',
    'retweeted_status["text"]',
    'retweeted_status["full_text"]',
    'is_quote_status',
    'extended_entities["media"]',
    'entities["media"]'
]

exports.searchForTweet = (req, res) => {
    const params = {
        tweet_mode: "extended",
        q: req.body.query,
        // count: req.body.count,
        count: 100,
        result_type: req.body.result_type,
        lang: req.body.language
    }
    let results = []
    T.get('search/tweets/', params, function(err, data, response) {
        if(!err){
            results = data.statuses;
            for (let i = 0; i < results.length; i++) {
                results[i] = _.pick(results[i], reducerArray);
            }
            return res.json({results})
        } else {
            return res.status(400).json({err})
        }
    })
}

exports.getTweetById = (req, res) => {
        const params = {
            id: req.params.tweetId,
            tweet_mode: "extended"
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

    const collectionName = req.body.collectionName
    const tweetId = req.params.tweetId;

    const user = db.collection("users").doc(`${email}`);
    const collection = db.collection(`${email}-(Collections)`).doc(`${collectionName}`);

    try {  
        await user.update({
            favorites: admin.firestore.FieldValue.arrayUnion(tweetId)
        });
    } catch (error) {
        return res.status(500).json({error: "Something went wrong, please try again"})
    }

    try {  
        await collection.update({
            [collectionName]: admin.firestore.FieldValue.arrayUnion(tweetId)
        })
    } catch (error) {
        return res.status(500).json({error: "Something went wrong, please try again"})
    }
   

    let userDetails = {};
    let collectionDetails = {};
    return db.doc(`users/${email}`).get()
        .then((doc) => {
            if(!doc.exists) {
                return res.status(400).json({error: "Sorry, this user does not exist"})
            }
            userDetails = doc.data();
            return db.doc(`${email}-(Collections)/${collectionName}`).get();
        })
        .then((doc) => {
            if(!doc.exists) {
                return res.status(400).json({error: "Sorry, this collection does not exist"})
            }
            collectionDetails = doc.data();
            return res.json({userDetails, collectionDetails});
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Something went wrong"})
        })


}


exports.deleteFavoriteTweet = async (req, res) => {

    const collectionName = req.body.collectionName
    const tweetId = req.params.tweetId;

    const user = db.collection("users").doc(`${email}`);
    const collection = db.collection(`${email}-(Collections)`).doc(`${collectionName}`);

    try {  
        await user.update({
            favorites: admin.firestore.FieldValue.arrayRemove(tweetId)
        });
    } catch (error) {
        return res.status(500).json({error: "Something went wrong, please try again"})
    }

    try {  
        await collection.update({
            [collectionName]: admin.firestore.FieldValue.arrayRemove(tweetId)
        })
    } catch (error) {
        return res.status(500).json({error: "Something went wrong, please try again"})
    }
   

    let userDetails = {};
    let collectionDetails = {};
    return db.doc(`users/${email}`).get()
        .then((doc) => {
            if(!doc.exists) {
                return res.status(400).json({error: "Sorry, this user does not exist"})
            }
            userDetails = doc.data();
            return db.doc(`${email}-(Collections)/${collectionName}`).get();
        })
        .then((doc) => {
            if(!doc.exists) {
                return res.status(400).json({error: "Sorry, this collection does not exist"})
            }
            collectionDetails = doc.data();
            return res.json({userDetails, collectionDetails});
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Something went wrong"})
        })

}


exports.getAllFavoriteTweets = (req, res) => {

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
        tweet_mode: "extended",
        screen_name: req.body.screen_name,
        count: 200
        // trim_user: true

    }

    return T.get(`statuses/user_timeline`, params, function (err, data, response) {
        if(!err){
                for (let i = 0; i < data.length; i++) {
                    data[i] = _.pick(data[i], reducerArray)
                    if(data[i].user.screen_name === "_andrestyles") {
                        data = [];
                    }
                }
                results = data;
                return res.json({results})
        } else {
            console.log(err)
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
    let userDetails;
    db.doc(`users/${email}`).get()
        .then((doc) => {
            collectionCount = doc.data().collectionCount;
            if (collectionCount < 10) {
                
                return db.collection(`${email}-(Collections)`).where("collectionName", "==", collectionName).get();
            } else {
                return res.status(400).json({error: "You have reached your collection limit"})
            }
        })
        .then( async (data) => {
            let collections = [];
            data.forEach((doc) => {
                collections.push(doc.data());
            })
            if (!Array.isArray(collections) || !collections.length) { // collection does not exist
                await db.doc(`users/${email}`).update({collectionCount: collectionCount + 1});
                await db.collection("users").doc(`${email}`).update({
                    collections: admin.firestore.FieldValue.arrayUnion(collectionName)
                });
                await db.doc(`users/${email}`).get()
                    .then((doc) => {
                        userDetails = doc.data();
                    })
                return db.doc(`${email}-(Collections)/${newCollection.collectionName}`).set(newCollection);
            } else {
                return res.status(400).json({error: "You already have a collection with this name"})
            }
        })
        .then(() => {
            collectionDetails = newCollection;
            return res.json({collectionDetails, userDetails})
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Something went wrong"})
        })

}


exports.getTweetsFromCollection = (req, res) => {

    const collectionName = req.body.collectionName;
    console.log("hello" + collectionName + "hey")

    let results = [];
    let collectionDetails;
    let collectionFavorites = []
    db.doc(`${email}-(Collections)/${collectionName}`).get()
        .then( async (doc) => {
            console.log(doc.data())
            if(!doc.exists) {
                console.log("ohhhhh")
                return res.status(400).json({error: "Sorry, this collection does not exist"})
            }
            console.log("yassssy")
            collectionDetails = doc.data();
            collectionFavorites = doc.data()[`${req.body.collectionName}`];
            console.log(collectionFavorites)
            let length = collectionFavorites.length;
            let collectionFavoritesIds = collectionFavorites.toString();

            const params = {
                id: collectionFavoritesIds,
                tweet_mode: "extended"
            }

            return T.get(`statuses/lookup`, params, function (err, data, response) {
                if(!err){
                        for (let i = 0; i < data.length; i++) {
                            data[i] = _.pick(data[i], reducerArray)
                        }
                        results = data;
                        return res.json({length, collectionDetails, results})
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



exports.getPlaceId = (req, res) => {
    const params = {
        query: req.body.country,
        granularity: "country"
    }

    return T.get(`geo/search`, params, function (err, data, response) {
        if(!err){
                // for (let i = 0; i < data.length; i++) {
                //     data[i] = _.pick(data[i], reducerArray)
                // }
                results = data;
                return res.json({results})
        } else {
            return res.status(400).json({err})
        }
    })
}