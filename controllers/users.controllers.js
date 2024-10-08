const { fetchUsers } = require('../models/users.models.js');

module.exports.getUsers = async (req, res) => {
  try {
    const users = await fetchUsers();
    res.status(200).send({ users });
  } catch (err) {
    console.log(err);
  }
};
