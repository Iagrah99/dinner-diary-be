const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getEndpoints } = require('./controllers/api.controller.js');

const {
  getUsers,
  getUserById,
  getUserMeals,
  addUser,
  loginUser,
  updateUser,
  removeUser,
} = require('./controllers/users.controllers.js');

const {
  getMeals,
  getMealById,
  addMeal,
  updateMeal,
  removeMeal,
} = require('./controllers/meals.controllers.js');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/api', getEndpoints);
app.get('/api/users', getUsers);
app.get('/api/users/:user_id', getUserById);
app.get('/api/users/:user_id/meals', verifyToken, getUserMeals);
app.post('/api/users', addUser);
app.post('/api/users/login', loginUser);
app.patch('/api/users/:user_id', verifyToken, updateUser);
app.delete('/api/users/:user_id', verifyToken, removeUser);

app.get('/api/meals', getMeals);
app.get('/api/meals/:meal_id', getMealById);
app.post('/api/meals', verifyToken, addMeal);
app.patch('/api/meals/:meal_id', verifyToken, updateMeal);
app.delete('/api/meals/:meal_id', verifyToken, removeMeal);

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader) {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).send();
  }
}

// Error Handling Middleware

app.use((err, req, res, next) => {
  const type = req.path.split('/')[2].slice(0, -1);
  if (err.code === '22P02') {
    res
      .status(400)
      .send({ msg: `Bad request. Please provide a valid ${type}_id.` });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

module.exports = app;
