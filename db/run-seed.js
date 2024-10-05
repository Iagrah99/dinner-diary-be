const seed = require('./seed.js');
const db = require('./connection.js');

seed().then(() => {
  db.end();
});
