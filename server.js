const express = require('express');

const {
  getUsers,
  getUserById,
  addUser,
  loginUser,
  updateUser,
} = require('./controllers/users.controllers.js');

const {
  getMeals,
  getMealById,
  addMeal,
} = require('./controllers/meals.controllers.js');

const app = express();
app.use(express.json());

app.get('/api/users', getUsers);
app.get('/api/users/:user_id', getUserById);
app.post('/api/users', addUser);
app.post('/api/users/login', loginUser);
app.patch('/api/users/:user_id', updateUser);

app.get('/api/meals', getMeals);
app.get('/api/meals/:meal_id', getMealById);
app.post('/api/meals', addMeal);

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
