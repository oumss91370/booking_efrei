require('dotenv').config();
const sql = require('../src/config/db');

(async () => {
  try {
    const rooms = [
      { name: 'Salle Alpha', capacity: 6, amenities: ['TV','Wifi'] },
      { name: 'Salle Beta', capacity: 10, amenities: ['Projecteur','Tableau'] },
      { name: 'Salle Gamma', capacity: 4, amenities: [] },
    ];
    for (const r of rooms) {
      await sql`
        INSERT INTO rooms (name, capacity, amenities)
        VALUES (${r.name}, ${r.capacity}, ${r.amenities})
        ON CONFLICT (name) DO NOTHING
      `;
    }
    console.log('Seed terminé: rooms insérées.');
    process.exit(0);
  } catch (e) {
    console.error('Seed ERROR:', e.message);
    process.exit(1);
  }
})();
