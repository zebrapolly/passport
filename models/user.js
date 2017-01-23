const mongo = require('mongoose');

const userSchema = new mongo.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongo.model('User', userSchema);