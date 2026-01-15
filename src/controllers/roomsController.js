const Room = require('../models/Room');

const roomsController = {
  async list(req, res, next) {
    try {
      const rooms = await Room.listAll();
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  },

  async available(req, res, next) {
    try {
      const { start_time, end_time } = req.query;
      if (!start_time || !end_time) {
        return res.status(400).json({ message: 'start_time et end_time requis (ISO)' });
      }
      const rooms = await Room.findAvailable({ start_time, end_time });
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name, capacity, amenities } = req.body;
      if (!name || !capacity) return res.status(400).json({ message: 'name et capacity requis' });
      const room = await Room.create({ name, capacity, amenities });
      res.status(201).json(room);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = roomsController;
