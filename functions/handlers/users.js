const { db, firebase } = require('../utilities/admin');

const { validateSignupData, validateLoginData } = require('../utilities/validators');


exports.signup = (req, res) => {
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    }

    const { valid, errors} = validateSignupData(newUser);

    if (!valid) {
        let name = errors.name;
        let email = errors.email;
        let password = errors.password;
        let confirmPassword = errors.confirmPassword;
        return res.status(400).json({name, email, password, confirmPassword});
    }

    let token, userId;
    let userDetails = {};
    db.doc(`users/${newUser.email}`).get()
        .then((doc) => {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
                userDetails = {
                name: newUser.name,
                email: newUser.email,
                userId: userId,
                favorites: [],
                createdAt: new Date().toISOString()
            }
            return db.doc(`users/${newUser.email}`).set(userDetails);
        })
        .then(() => {
            return res.json({token, userDetails});
        })
        .catch((error) => {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'This email is already in use' });
            } else if (error.code === 'auth/weak-password') {
                return res.status(400).json({ password: 'Please use a stronger password' });
            } else { 
                return res.status(500).json({ general: "Something went wrong, please try again" });
            }
        })
}


exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    const { valid, errors } = validateLoginData(user);

    if (!valid) {
        let password = errors.password;
        let email = errors.email;
        return res.status(400).json({email, password});
    }


    let token;
    let userDetails = {};
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
        return data.user.getIdToken();
    })
    .then((idToken) => {
        token = idToken;
        return db.doc(`users/${user.email}`).get();
    })
    .then((doc) => {
        userDetails = doc.data();
        return res.json({token, userDetails})
    })
    .catch((error) => {
        if (error.code === 'auth/wrong-password') {
            return res.status(403).json({ password: 'Wrong password, please try again' });
        } else if (error.code === 'auth/user-not-found') {
            return res.status(403).json({ email: 'This email is not registered as a user' });
        } else if (error.code === 'auth/invalid-email') {
            return res.status(403).json({ email: 'Please enter a valid email' });
        } else if (error.code === 'auth/too-many-requests') {
            return res.status(403).json({ email: 'Too many invalid requests, please try again later' });
        }else {
            console.log(error)
            return res.status(500).json({ general: "Something went wrong, please try again" })
        }
    })
}


exports.getUserDetail = (req, res) => {
    db.doc('users/user@email.com').get()
        .then((doc) => {
            let hello = doc.data();
            let fieldLength = Object.keys(hello).length
            return res.json({fieldLength, hello})
        })
}