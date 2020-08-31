// declare empty field; to later disallow white spaces in entries
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

// Compare and conform email entry to regular format
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
}

exports.validateSignupData = (data) => {
    let errors = {};
    if (isEmpty(data.email)) {
        errors.email = 'Please enter a valid email address'
    } else if (!isEmail(data.email)) {
        errors.email = 'Please enter a valid email address'
    }

    if (isEmpty(data.password)) errors.password = 'Please enter a password';
    if (isEmpty(data.name)) errors.name = 'Please enter a name for your profile';
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match, please try again';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}


exports.validateLoginData = (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = 'Please enter a valid email address'
    } else if (!isEmail(data.email)) {
        errors.email = 'Please enter a valid email address'
    }

    if (isEmpty(data.password)) errors.password = 'Please enter a password';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}