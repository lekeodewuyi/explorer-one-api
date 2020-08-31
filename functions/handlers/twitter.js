const { db, admin, T } = require('../utilities/admin');


// var params = {
//     q: '#nodejs',
//     count: 10,
//     result_type: 'recent',
//     lang: 'en'
//   }

// T.get('search/tweets', params, function(err, data, response) {
// if(!err){
//     console.log(data)
//     // This is where the magic will happen
// } else {
//     console.log(err);
// }
// })


exports.searchForTweet = (req, res) => {
    const params = {
        q: req.body.query,
        count: req.body.count,
        result_type: 'recent',
        lang: req.body.lang
        // lang: 'en'
    }

    T.get('search/tweets', params, function(err, data, response) {
        if(!err){
            return res.json({data})
        } else {
            return res.status(400).json({err})
            console.log(err);
        }
        })
}

exports.getTweetById = (req, res) => {
        const params = {
            id: "1300354705743282176"
        }

        T.get('statuses/show/', params, function(err, data, response) {
            if(!err){
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