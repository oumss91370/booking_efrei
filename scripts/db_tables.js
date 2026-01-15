require('dotenv').config();
const sql = require('../src/config/db');

(async () => {
  try {
    const rows = await sql`
      select table_name 
      from information_schema.tables 
      where table_schema='public' 
        and table_name in ('users','rooms','bookings')
      order by table_name
    `;
    console.log('Tables found:', rows.map(r => r.table_name));
    process.exit(0);
  } catch (e) {
    console.error('DB ERROR:', e.message);
    process.exit(1);
  }
})();
