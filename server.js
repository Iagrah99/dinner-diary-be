const express = require('express');

const { getUsers, getUserById } = require('./controllers/users.controllers.js');

const app = express();

app.get('/api/users', getUsers);
app.get('/api/users/:user_id', getUserById);

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
  }
});

module.exports = app;
