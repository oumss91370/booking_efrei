const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL in environment variables');
}
// Supabase Postgres usually requires SSL
const sql = postgres(connectionString, { ssl: 'require' });
module.exports = sql;
