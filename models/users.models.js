const db = require('../db/connection.js');
const bcrypt = require('bcrypt');
const {
  checkEmailExists,
  checkUsernameExists,
} = require('../utils/userUtils.js');

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

module.exports.postUser = async (user) => {
  if (!user.email) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request. Please provide an email.',
    });
  }

  if (!user.username) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request. Please provide a username.',
    });
  }

  if (!user.password) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request. Please provide a password.',
    });
  }

  const emailExists = await checkEmailExists(user.email);
  const usernameExists = await checkUsernameExists(user.username);

  if (emailExists) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request. A user with that email already exists.',
    });
  }

  if (usernameExists) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request. A user with that username already exists.',
    });
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(user.password, salt);
  const postedUser = (
    await db.query(
      `
      INSERT INTO users
        (email, username, password, avatar)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *;
    `,
      [
        user.email,
        user.username,
        hashedPassword,
        user.avatar || 'https://i.ibb.co/xmZqs9Y/default-avatar.png',
      ]
    )
  ).rows[0];

  return postedUser;
};

module.exports.fetchUser = async (username, password) => {
  if (!username) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide a username.',
    });
  }

  if (!password) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide a password.',
    });
  }

  const userInfo = (
    await db.query('SELECT * FROM users WHERE username = $1', [username])
  ).rows[0];

  if (!userInfo) {
    return Promise.reject({
      status: 400,
      msg: 'There is no registered user account that is associated with that username',
    });
  }

  let userDetails = {};

  if (await bcrypt.compare(password, userInfo.password)) {
    userDetails = {
      user_id: userInfo.user_id,
      email: userInfo.email,
      username: userInfo.username,
      avatar: userInfo.avatar,
      date_joined: userInfo.date_joined,
    };
  } else {
    return Promise.reject({
      status: 400,
      msg: 'Incorrect password. Please try again!',
    });
  }

  return userDetails;
};
