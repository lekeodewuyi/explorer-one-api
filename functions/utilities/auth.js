const { admin } = require('./admin');
const { db } = require('./admin')

exports.auth = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found')
        return res.status(403).json({ error: 'Unauthorized' });
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            email = req.user.email;
            console.log("Token successfully decoded");
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            userDetails = data.docs[0].data();
            // req.user.handle = data.docs[0].data().handle;
            // req.user.isDiabetic = data.docs[0].data().isDiabetic;
            // req.user.isNutAllergic = data.docs[0].data().isNutAllergic;
            // req.user.isPeanutAllergic = data.docs[0].data().isPeanutAllergic;
            // req.user.imageUrl = data.docs[0].data().imageUrl;
            // req.user.condition = data.docs[0].data().condition;
            // console.log(req.user.condition);
            // console.log("user details successfully extracted from auth token")
            return next();
        })
        .catch(err => {
            if (err.code === 'auth/argument-error') {
                return res.status(401).json({ token: 'This is an unauthorized token, please use a valid token' })
            } else {
                console.error('Error while verifying token ', err);
                return res.status(403).json(err);
            }
        })
}