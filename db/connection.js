const { Pool } = require('pg');

const ENV = process.env.NODE_ENV || 'development';

const path = `${__dirname}/../.env.${ENV}`;

require('dotenv').config({ path });

const config = {};

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error('PGDATABASE or DATABASE_URL not set');
}

if (ENV === 'production') {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 5;
}

const pool = new Pool(config);

module.exports = pool;
