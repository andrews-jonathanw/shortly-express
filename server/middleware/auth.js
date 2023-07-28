const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('session part cookies', req.cookies);
  console.log('session part request body', req.body);

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

