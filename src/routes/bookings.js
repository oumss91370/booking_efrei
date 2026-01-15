const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const auth = require('../middleware/auth');

router.post('/', auth, bookingsController.create);
router.get('/mine', auth, bookingsController.mine);
router.delete('/:id', auth, bookingsController.cancel);

module.exports = router;
