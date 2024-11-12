// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  getUserMeals,
  addUser,
  updateUser,
  removeUser,
} = require('../controllers/users.controllers.js');
const verifyToken = require('../middlewares/verifyToken'); // Middleware for protected routes

// Define user-related routes
router.get('/', getUsers);
router.get('/:user_id', getUserById);
router.get('/:user_id/meals', verifyToken, getUserMeals);
router.post('/', addUser);
router.patch('/:user_id', verifyToken, updateUser);
router.delete('/:user_id', verifyToken, removeUser);

module.exports = router;
