DROP DATABASE IF EXISTS weekly_meals_test;
CREATE DATABASE weekly_meals_test;

\c weekly_meals_test

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) UNIQUE NOT NULL,
  date_joined DATE DEFAULT CURRENT_DATE 
);

CREATE TABLE meals (
  meal_id SERIAL PRIMARY KEY,
  created_by VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
  name VARCHAR(255) NOT NULL,
  ingredients TEXT[] NOT NULL,
  last_eaten DATE DEFAULT CURRENT_DATE
);

INSERT INTO users
  (email, username, password)
VALUES
 ('mealplanner_mum@example.com', 'MealPlannerMum', 'strong_password123'),
 ('fitness_fanatic@example.com', 'FitnessFanatic', 'secure_fitness123'),
 ('student_foodie@example.com', 'StudentFoodie', 'unique_password123');

INSERT INTO meals
 (created_by, name, ingredients)
VALUES
  ('MealPlannerMum', 'Spaghetti Bolognese', '{"spaghetti", "ground beef", "tomato sauce", "onion", "garlic"}'),
  ('FitnessFanatic', 'Grilled Chicken Salad', '{"chicken breast", "mixed greens", "avocado", "tomatoes", "vinaigrette"}'),
  ('StudentFoodie', 'Mac and Cheese', '{"macaroni", "cheddar cheese", "milk", "butter", "flour"}');

-- SELECT * FROM users;
-- SELECT * FROM meals;

SELECT * FROM meals
WHERE name LIKE '% Cheese';
