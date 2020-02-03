var mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: String,
    stars: Number,
    done: Boolean,
    color: {type: String, enum: ['blue', 'yellow', 'green', 'black', 'white'], default: 'black'},
});

module.exports = mongoose.model('Task', taskSchema);