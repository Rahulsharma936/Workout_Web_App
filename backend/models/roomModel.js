const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    host: {
        type: String,
        required: true
    },
    users: [{
        type: String
    }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
