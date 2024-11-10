const {
  fetchUsers,
  fetchUserById,
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

module.exports.getUserMeals = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const userMeals = await fetchUserMeals(user_id);
    res.status(200).send({ meals: userMeals });
  } catch (err) {
    next(err);
  }
};

module.exports.addUser = async (req, res, next) => {
  const { user } = req.body;
  try {
    const newUser = await postUser(user);
    res.status(201).send({ user: newUser });
  } catch (err) {
    next(err);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const { user } = req.body;
  try {
    const fetchedUser = await fetchUser(user.username, user.password);
    jwt.sign(
      { user: fetchedUser },
      `${process.env.JWT_SECRET}`,
      { expiresIn: '3 days' },
      (err, token) => {
        if (err) {
          return next(err);
        }
        res.status(201).send({ user: fetchedUser, token });
      }
    );
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
