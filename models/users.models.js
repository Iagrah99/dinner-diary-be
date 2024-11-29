const db = require('../db/connection.js');
const bcrypt = require('bcrypt');
const {
  checkEmailExists,
  checkUsernameExists,
  checkUserIdExists,
} = require('../utils/userUtils.js');

module.exports.fetchUsers = async () => {
  const users = (await db.query('SELECT * FROM users')).rows;
  return users;
};

module.exports.fetchUserById = async (user_id) => {
  const user = (
    await db.query(
      'SELECT user_id, email, username, avatar, date_joined FROM users WHERE user_id = $1',
      [user_id]
    )
  ).rows[0];

  if (!user) {
    return Promise.reject({
      status: 404,
      msg: 'The user with the specified user_id does not exist.',
    });
  }

  return user;
};

module.exports.fetchUsername = async (username) => {
  const usernameTaken = await checkUsernameExists(username);

  if (usernameTaken) {
    return Promise.reject({
      status: 400,
      msg: 'Username is taken',
    });
  }

  return usernameTaken;
};

module.exports.fetchEmail = async (email, check) => {
  const emailTaken = await checkEmailExists(email);

  if (emailTaken && check === 'registration') {
    return Promise.reject({
      status: 400,
      msg: 'Email is taken',
    });
  }

  if (!emailTaken && check === 'reset_password') {
    return Promise.reject({
      status: 400,
      msg: 'This email is not associated with any accounts.',
    });
  }

  if (check === 'reset_password') {
    return 'An email with instructions was sent to your account.';
  }
  if (check === 'registration') {
    return 'Email is not taken';
  }
};

module.exports.fetchUserMeals = async (
  requestedUserId,
  loggedInUserId,
  sort_by = 'last_eaten',
  order_by = 'DESC'
) => {
  const validSortByQueries = ['last_eaten', 'name', 'source', 'rating'];

  if (!validSortByQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: 'Invalid sort by query' });
  }

  if (isNaN(requestedUserId)) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request. Please provide a valid user_id.',
    });
  }

  const userExistsQuery = await checkUserIdExists(requestedUserId);
  if (!userExistsQuery) {
    return Promise.reject({
      status: 404,
      msg: 'The user with the specified user_id does not exist.',
    });
  }

  // If the logged-in user is trying to access a different user's meals, throw a 403 error
  if (Number(requestedUserId) !== loggedInUserId) {
    return Promise.reject({
      status: 403,
      msg: "Forbidden: You are not authorized to access this user's meals.",
    });
  }

  // Fetch the requested user's meals from the database
  const user = (
    await db.query('SELECT * FROM users WHERE user_id = $1', [requestedUserId])
  ).rows[0];

  // Fetch meals created by the user
  const userMeals = (
    await db.query(
      `SELECT * FROM meals WHERE created_by = $1 ORDER BY ${sort_by} ${order_by}`,
      [user.username]
    )
  ).rows;

  return userMeals;
};

module.exports.postUser = async (user) => {
  if (!user.email) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide an email.',
    });
  }

  if (!user.username) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide a username.',
    });
  }

  if (!user.password) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide a password.',
    });
  }

  if (!user.date_joined) {
    return Promise.reject({
      status: 400,
      msg: 'No date_joined was provided for the user.',
    });
  }

  const emailExists = await checkEmailExists(user.email);
  const usernameExists = await checkUsernameExists(user.username);

  if (emailExists) {
    return Promise.reject({
      status: 400,
      msg: 'A user with that email already exists.',
    });
  }

  if (usernameExists) {
    return Promise.reject({
      status: 400,
      msg: 'A user with that username already exists.',
    });
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(user.password, salt);
  const postedUser = (
    await db.query(
      `
      INSERT INTO users
        (email, username, password, avatar, date_joined)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
      [
        user.email,
        user.username,
        hashedPassword,
        user.avatar || 'https://i.ibb.co/xmZqs9Y/default-avatar.png',
        user.date_joined,
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

module.exports.patchUser = async (user, user_id) => {
  const userExists = await checkUserIdExists(user_id);

  if (!userExists) {
    return Promise.reject({
      status: 404,
      msg: 'The user with the specified user_id does not exist.',
    });
  }

  let query = 'UPDATE users SET ';
  const queryParams = [];
  let queryIndex = 1;

  if (user.username) {
    const usernameExists = await checkUsernameExists(user.username);
    if (!usernameExists) {
      query += `username = $${queryIndex}, `;
      queryParams.push(user.username);
      queryIndex++;
    } else {
      return Promise.reject({
        status: 400,
        msg: 'That username is already taken.',
      });
    }
  }

  if (user.password) {
    query += `password = $${queryIndex}, `;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password, salt);
    queryParams.push(hashedPassword);
    queryIndex++;
  }

  if (user.avatar) {
    query += `avatar = $${queryIndex}, `;
    queryParams.push(user.avatar);
    queryIndex++;
  }

  query = query.slice(0, -2);

  query += ` WHERE user_id = $${queryIndex} RETURNING *;`;
  queryParams.push(user_id);

  const updatedUser = (await db.query(query, queryParams)).rows[0];

  return updatedUser;
};

module.exports.deleteUser = async (user, user_id) => {
  // Check to see if the user exists before doing a password comparison
  const userExists = await checkUserIdExists(user_id);

  if (!user) {
    return Promise.reject({
      status: 400,
      msg: 'Incorrect request structure: missing user object.',
    });
  }

  if (!user.password) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide a password.',
    });
  }

  if (!userExists) {
    return Promise.reject({
      status: 404,
      msg: 'The user with the specified user_id does not exist.',
    });
  }

  const correctPassword = (
    await db.query('SELECT password FROM users WHERE user_id = $1', [user_id])
  ).rows[0].password;

  const passwordMatches = await bcrypt.compare(user.password, correctPassword);

  if (!passwordMatches) {
    return Promise.reject({
      status: 400,
      msg: 'The password you provided is incorrect.',
    });
  }

  await db.query('DELETE FROM users WHERE user_id = $1', [user_id]);

  return;
};
