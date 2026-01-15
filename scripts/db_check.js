require('dotenv').config();
const sql = require('../src/config/db');

(async () => {
  try {
    const rows = await sql`select 1 as ok`;
    console.log('DB OK:', rows[0]);
    process.exit(0);
  } catch (e) {
    console.error('DB ERROR:', e.message);
    process.exit(1);
  }
})();
