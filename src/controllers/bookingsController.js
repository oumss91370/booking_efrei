const Booking = require('../models/Booking');

const bookingsController = {
  async create(req, res, next) {
    try {
      const { room_id, start_time, end_time } = req.body;
      if (!room_id || !start_time || !end_time) return res.status(400).json({ message: 'room_id, start_time, end_time requis' });
      const booking = await Booking.create({ user_id: req.user.userId, room_id, start_time, end_time });
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  },

  async mine(req, res, next) {
    try {
      const bookings = await Booking.listByUser(req.user.userId);
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  },

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      await Booking.remove(id, req.user.userId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = bookingsController;
