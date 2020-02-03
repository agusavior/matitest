var mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    pass: String,
    token: Number,
});

module.exports = mongoose.model('User', userSchema);