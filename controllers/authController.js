// controllers/authController.js

const jwt = require('jsonwebtoken');
const { fetchUser } = require('../models/users.models.js'); // Ensure fetchUser verifies username/password

exports.loginUser = async (req, res, next) => {
  const { user } = req.body;

  try {
    // Fetch the user based on provided credentials; model handles validation
    const fetchedUser = await fetchUser(user.username, user.password);

    // Generate JWT with user info, including user_id and username
    const token = jwt.sign(
      { userId: fetchedUser.user_id, username: fetchedUser.username }, // Use fetchedUser.user_id here
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1m' }
    );

    // Return user info along with token
    res.status(201).send({ user: fetchedUser, token });
  } catch (err) {
    next(err); // Pass any errors to error handling middleware
  }
};
