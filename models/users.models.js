const db = require('../db/connection.js');

module.exports.fetchUsers = async () => {
  const users = (await db.query('SELECT * FROM users')).rows;
  return users;
};

module.exports.fetchUserById = async (user_id) => {
  const user = (
    await db.query(
      'SELECT user_id, email, username, avatar FROM users WHERE user_id = $1',
      [user_id]
    )
  ).rows[0];

  if (!user) {
    return Promise.reject({
      status: 404,
      msg: 'The user with the specified user_id was not found.',
    });
  }

  return user;
};
