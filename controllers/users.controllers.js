const {
  fetchUsers,
  fetchUserById,
  postUser,
  fetchUser,
} = require('../models/users.models.js');

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
    res.status(201).send({ user: fetchedUser });
  } catch (err) {
    next(err);
  }
};
