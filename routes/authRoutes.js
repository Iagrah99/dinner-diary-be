// routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Define login route
router.post('/login', authController.loginUser);

module.exports = router;
