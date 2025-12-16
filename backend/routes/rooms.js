const express = require('express');
const {
    getRooms,
    createRoom,
    deleteRoom
} = require('../controllers/roomController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();


router.use(requireAuth);


router.get('/', getRooms);


router.post('/', createRoom);


router.delete('/:id', deleteRoom);

module.exports = router;
