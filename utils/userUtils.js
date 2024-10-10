const db = require('../db/connection.js');

module.exports.checkEmailExists = async (email) => {
  const emailExistsQuery = await db.query(
    'SELECT email FROM users WHERE email = $1',
    [email]
  );

  return emailExistsQuery.rowCount > 0;
};

module.exports.checkUsernameExists = async (username) => {
  const usernameExistsQuery = await db.query(
    'SELECT username FROM users WHERE username = $1',
    [username]
  );

  return usernameExistsQuery.rowCount > 0;
};
