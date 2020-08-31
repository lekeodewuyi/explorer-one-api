const { db, T } = require('../utilities/admin');


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