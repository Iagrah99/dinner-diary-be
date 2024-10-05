const { Pool } = require('pg');

if (!process.env.PGDATABASE) {
  throw new Error('no PGDATABASE set!');
}

const db = new Pool();

module.exports = db;
