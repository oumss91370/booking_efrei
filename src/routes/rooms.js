const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');
const auth = require('../middleware/auth');

router.get('/', roomsController.list);
router.get('/available', roomsController.available);
router.post('/', auth, roomsController.create);

module.exports = router;
