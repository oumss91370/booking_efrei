const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password, username } = req.body;
      if (!email || !password || !username) {
        return res.status(400).json({ message: 'Champs requis manquants' });
      }
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ email, password: hashed, username });
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
      }
      const user = await User.findByEmail(email);
      if (!user) return res.status(401).json({ message: 'Identifiants invalides' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
