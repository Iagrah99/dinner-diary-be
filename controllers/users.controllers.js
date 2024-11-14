const {
  fetchUsers,
  fetchUserById,
  fetchUsername,
  fetchEmail,
  fetchUserMeals,
  postUser,
  fetchUser,
  patchUser,
  deleteUser,
} = require('../models/users.models.js');
const jwt = require('jsonwebtoken');

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await fetchUsers();
    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
};

module.exports.getUserById = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const fetchedUser = await fetchUserById(user_id);
    res.status(200).send({ user: fetchedUser });
  } catch (err) {
    next(err);
  }
};

module.exports.getUserByUsername = async (req, res, next) => {
  const { username } = req.params;
  try {
    await fetchUsername(username);
    res.status(200).send({ msg: 'Username is not taken' });
  } catch (err) {
    next(err);
  }
};

module.exports.getUserByEmail = async (req, res, next) => {
  const { email } = req.params;
  try {
    await fetchEmail(email);
    res.status(200).send({ msg: 'Email is not taken' });
  } catch (err) {
    next(err);
  }
};

exports.getUserMeals = async (req, res, next) => {
  const { user_id } = req.params;
  const { user } = req;
  const { sort_by, order_by } = req.query;

  try {
    const meals = await fetchUserMeals(user_id, user.userId, sort_by, order_by);
    res.status(200).send({ meals });
  } catch (err) {
    next(err);
  }
};

module.exports.addUser = async (req, res, next) => {
  const { user } = req.body;
  try {
    const newUser = await postUser(user);

    const payload = {
      username: newUser.username,
      userId: newUser.user_id, // Add the user_id to the payload
    };

    jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
      if (err) {
        return next(err);
      }
      res.status(201).send({ user: newUser, token });
    });
  } catch (err) {
    next(err);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const { user } = req.body;
  try {
    // Fetch the user details
    const fetchedUser = await fetchUser(user.username, user.password);

    // Create a payload for the JWT, including the 'user_id'
    const payload = {
      username: fetchedUser.username,
      userId: fetchedUser.user_id, // Add the user_id to the payload
    };

    // Sign the token with the payload including 'user_id'
    jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
      if (err) {
        return next(err);
      }
      // Send the token and user info in the response
      res.status(201).send({ user: fetchedUser, token });
    });
  } catch (err) {
    next(err);
  }
};

module.exports.updateUser = async (req, res, next) => {
  const { user } = req.body;
  const { user_id } = req.params;
  try {
    const updatedUser = await patchUser(user, user_id);
    res.status(200).send({ user: updatedUser });
  } catch (err) {
    next(err);
  }
};

module.exports.removeUser = async (req, res, next) => {
  const { user_id } = req.params;
  const { user } = req.body;
  try {
    await deleteUser(user, user_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
