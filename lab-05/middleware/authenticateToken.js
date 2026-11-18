const jwt = require('jsonwebtoken');
const SECRET_KEY = 'AURORA_BDF_LAB_SECRET_KEY';

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers['authorization'];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1];
  }
  if (jwtToken === undefined) {
    return response.status(401).send('Invalid JWT Token');
  } else {
    jwt.verify(jwtToken, SECRET_KEY, (error, payload) => {
      if (error) {
        return response.status(401).send('Invalid JWT Token');
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
};

module.exports = authenticateToken;
