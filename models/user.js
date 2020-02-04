var mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    user: { type: String, required: true, unique: true },
    pass: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);