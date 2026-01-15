const sql = require('../config/db');

const Booking = {
  async create({ user_id, room_id, start_time, end_time }) {
    // Overlap check
    const overlaps = await sql`
      SELECT 1
      FROM bookings
      WHERE room_id = ${room_id}
        AND start_time < ${end_time}::timestamptz
        AND end_time   > ${start_time}::timestamptz
      LIMIT 1
    `;
    if (overlaps.length) {
      const err = new Error('Room not available for the selected time slot');
      err.name = 'ValidationError';
      throw err;
    }

    const rows = await sql`
      INSERT INTO bookings (user_id, room_id, start_time, end_time)
      VALUES (${user_id}, ${room_id}, ${start_time}, ${end_time})
      RETURNING *
    `;
    return rows[0];
  },

  async listByUser(user_id) {
    const rows = await sql`
      SELECT b.*, r.name AS room_name
      FROM bookings b
      JOIN rooms r ON r.id = b.room_id
      WHERE b.user_id = ${user_id}
      ORDER BY b.start_time DESC
    `;
    return rows;
  },

  async remove(id, user_id) {
    // Ensure the booking belongs to the user
    const rows = await sql`SELECT * FROM bookings WHERE id = ${id} LIMIT 1`;
    const b = rows[0];
    if (!b || String(b.user_id) !== String(user_id)) {
      const err = new Error('Unauthorized');
      err.name = 'UnauthorizedError';
      throw err;
    }
    await sql`DELETE FROM bookings WHERE id = ${id}`;
    return true;
  }
};

module.exports = Booking;
