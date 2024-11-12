// routes/mealRoutes.js

const express = require('express');
const router = express.Router();
const {
  getMeals,
  getMealById,
  addMeal,
  updateMeal,
  removeMeal,
} = require('../controllers/meals.controllers.js');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', getMeals);
router.get('/:meal_id', getMealById);
router.post('/', verifyToken, addMeal);
router.patch('/:meal_id', verifyToken, updateMeal);
router.delete('/:meal_id', verifyToken, removeMeal);

module.exports = router;
