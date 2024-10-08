const express = require('express');

const { getUsers } = require('./controllers/users.controllers.js');

const app = express();

app.get('/api/users', getUsers);

module.exports = app;
