const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getEndpoints } = require('./controllers/api.controller.js');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const mealRoutes = require('./routes/mealRoutes.js');
const { psqlError, customError } = require('./middlewares/errorHandling.js');
const {
  getUserByUsername,
  getUserByEmail,
} = require('./controllers/users.controllers.js');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

app.get('/api', getEndpoints);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.get('/api/usernames/:username', getUserByUsername);
app.get('/api/emails/:email', getUserByEmail);

app.use(psqlError);
app.use(customError);

module.exports = app;
