const {
  fetchMeals,
  fetchMealById,
  postMeal,
  patchMeal,
  deleteMeal,
} = require('../models/meals.models.js');
const jwt = require('jsonwebtoken');

module.exports.getMeals = async (req, res, next) => {
  const { sort_by, order_by } = req.query;
  try {
    const meals = await fetchMeals(sort_by, order_by);
    res.status(200).send({ meals });
  } catch (err) {
    next(err);
  }
};

module.exports.getMealById = async (req, res, next) => {
  const { meal_id } = req.params;
  try {
    const fetchedMeal = await fetchMealById(meal_id);
    res.status(200).send({ meal: fetchedMeal });
  } catch (err) {
    next(err);
  }
};

module.exports.addMeal = async (req, res, next) => {
  const { meal } = req.body;
  try {
    const addedMeal = await postMeal(meal);
    res.status(201).send({ meal: addedMeal, user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports.updateMeal = async (req, res, next) => {
  const { meal } = req.body;
  const { meal_id } = req.params;
  try {
    const updatedMeal = await patchMeal(meal, meal_id);
    console.log(updatedMeal.last_eaten);
    res.status(200).send({ meal: updatedMeal });
  } catch (err) {
    next(err);
  }
};

module.exports.removeMeal = async (req, res, next) => {
  const { meal_id } = req.params;
  try {
    await deleteMeal(meal_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
