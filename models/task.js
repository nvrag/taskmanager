const mongoose = require('mongoose');

// Article Schema
const taskSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    author:{
        type: String
    },
    body:{
        type: String,
        required: true
    },
    for:{
        type: String
    }
});

const Task = module.exports = mongoose.model('Task', taskSchema);
