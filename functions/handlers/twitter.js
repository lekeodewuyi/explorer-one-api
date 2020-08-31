const { db, admin, T } = require('../utilities/admin');

const _ = require('lodash');


exports.searchForTweet = (req, res) => {
    const params = {
        q: req.body.query,
        count: req.body.count,
        result_type: 'recent',
        lang: req.body.language,
        geo: "england"
    }
    let results = []
    T.get('search/tweets', params, function (err, data, response) {
       try {
            results = data.statuses;
       } catch (err) {
           console.error(err)
           return res.status(500).json({general: "something went wrong"})
       } finally {
            let length = results.length;
            for (let i = 0; i < results.length; i++) {
                results[i] = _.pick(results[i], [
                    'id_str',
                    'created_at',
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
                    'is_quote_status',
                    'extended_entities["media"]'
                ])
            }
            return res.json({length, results})
       }
                
    })
    
}

exports.getTweetById = (req, res) => {
        const params = {
            id: req.params.tweetId
        }

        T.get('statuses/show/', params, function(err, data, response) {
            if(!err){
                data = _.pick(data, [
                    'id_str',
                    'created_at',
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
                    'is_quote_status',
                    'extended_entities["media"]'
                ])
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
    db.doc(`users/${email}`).get()
        .then( async (doc) => {
            if(!doc.exists) {
                return res.status(400).json({error: "Sorry, this user does not exist"})
            }
            favorites = doc.data().favorites;
            let results = []
            let count = 0;
            favorites.forEach( async (tweetId) => {
                await T.get(`statuses/show/${tweetId}`, function (err, data, response) {
                    if(!err){
                        count++
                        console.log(count)
                        results.push(data);
                        if (count === favorites.length) {
                            console.log(count)
                            let length = results.length;
                            for (let i = 0; i < results.length; i++) {
                                results[i] = _.pick(results[i], [
                                    'id_str',
                                    'created_at',
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
                                    'is_quote_status',
                                    'extended_entities["media"]'
                                ])
                            }
                            return res.json({length, results})
                        }
                    } else {
                        return res.status(400).json({err})
                    }
                })
            })

        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Something went wrong"})
        })
}