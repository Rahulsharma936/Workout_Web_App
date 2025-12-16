const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    host: {
        type: String, // Storing user ID or username
        required: true
    },
    users: [{
        type: String // List of user IDs currently in the room (optional, primarily managed by socket)
    }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
