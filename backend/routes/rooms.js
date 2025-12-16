const express = require('express');
const {
    getRooms,
    createRoom,
    deleteRoom
} = require('../controllers/roomController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// require auth for all room routes
router.use(requireAuth);

// GET all rooms
router.get('/', getRooms);

// POST a new room
router.post('/', createRoom);

// DELETE a room
router.delete('/:id', deleteRoom);

module.exports = router;
