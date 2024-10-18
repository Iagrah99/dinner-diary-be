const {
  fetchUsers,
  fetchUserById,
  postUser,
  fetchUser,
  patchUser,
  deleteUser,
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
