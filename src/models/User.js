const sql = require('../config/db');

const User = {
  async create({ email, password, username }) {
    const rows = await sql`
      INSERT INTO users (email, password, username)
      VALUES (${email}, ${password}, ${username})
      RETURNING *
    `;
    return rows[0];
  },

  async findByEmail(email) {
    const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    return rows[0] || null;
  }
};

module.exports = User;
