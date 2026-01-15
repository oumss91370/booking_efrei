const sql = require('../config/db');

const Room = {
  async listAll() {
    const rows = await sql`SELECT * FROM rooms ORDER BY id`;
    return rows;
  },

  async create({ name, capacity, amenities = [] }) {
    const rows = await sql`
      INSERT INTO rooms (name, capacity, amenities)
      VALUES (${name}, ${capacity}, ${amenities})
      RETURNING *
    `;
    return rows[0];
  },

  async findAvailable({ start_time, end_time }) {
    const overlapping = await sql`
      SELECT DISTINCT room_id
      FROM bookings
      WHERE start_time < ${end_time}::timestamptz
        AND end_time   > ${start_time}::timestamptz
    `;
    const blocked = new Set(overlapping.map(r => r.room_id));
    const rooms = await sql`SELECT * FROM rooms ORDER BY id`;
    return rooms.filter(r => !blocked.has(r.id));
  }
};

module.exports = Room;
