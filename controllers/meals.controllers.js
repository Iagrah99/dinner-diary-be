const { fetchMeals } = require('../models/meals.models.js');

module.exports.getMeals = async (req, res, next) => {
  try {
    const meals = await fetchMeals();
    res.status(200).send({ meals });
  } catch (err) {
    next(err);
  }
};
