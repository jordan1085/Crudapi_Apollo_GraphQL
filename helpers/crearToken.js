require('dotenv').config({ path: 'variables.env' });
const jwt = require('jsonwebtoken');

const generateJWT = (id = '') => {

  return new Promise((resolve, reject) => {

    const payload = { id };

    jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: 3600
    }, (err, token) => {
      if (err) {
        console.log(err);
        reject('No se pudo generar el jwt')
      } else {
        resolve(token)
      }
    })
  });
}

module.exports = {
  generateJWT
}