const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearerToken = bearerHeader.split(' ')[1];

    // Verify the token and decode it
    jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({ msg: 'Forbidden: Invalid token' });
      } else {
        // Attach decoded user information (user_id) to the request object
        req.user = { userId: decoded.userId };
        next();
      }
    });
  } else {
    return res.status(403).send({ msg: 'Forbidden: No token provided' });
  }
}

module.exports = verifyToken;
