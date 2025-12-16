const Room = require('../models/roomModel');
const mongoose = require('mongoose');


const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({}).sort({ createdAt: -1 });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


const createRoom = async (req, res) => {
    const { name } = req.body;
    const host = req.user._id;

    try {
        const room = await Room.create({ name, host });
        res.status(200).json(room);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


const deleteRoom = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such room' });
    }

    const room = await Room.findOneAndDelete({ _id: id });

    if (!room) {
        return res.status(400).json({ error: 'No such room' });
    }

    res.status(200).json(room);
}

module.exports = {
    getRooms,
    createRoom,
    deleteRoom
}
