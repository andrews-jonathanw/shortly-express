const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // if no cookies create a new session
  // check if cookies is undefined or key length is zero in object
  //console.log('INSIDE CREATE SESSION');
  if ((req.cookies === undefined) || Object.keys(req.cookies).length === 0) {
    //console.log('no cookies in the jar...');
    // create session
    models.Sessions.create().
      then((success) => {
        // retreive new session we made
        return models.Sessions.get({ id: success.insertId });
      })
      // use the object returned from get
      .then((success) => {
        //console.log(success);
        // save hash value in variable
        var hash = success.hash;
        // set session on req
        req.session = {hash};
        // set cookie for the response with use .cookie function
        res.cookie('shortlyid', hash);
        // call next
        next();
      })
      .catch((err) => {
        console.error('error creating a new session:' + err);
      });
  } else {
    //console.log('cookies in the jar');
    // look for session in sessions database (shortlyid for comparison)
    // again set hash variable
    var hash = req.cookies.shortlyid;
    // search using hash
    models.Sessions.get({hash})
      .then((data) => {
        if (data !== undefined) {
          //console.log(data);
          // a session was found set req and res as done above
          req.session = data;
          res.cookie('shortlyid', req.session.hash);
        } else {
          // console.log('NO SESSION');
          // no session found so lets create on
          models.Sessions.create()
            .then((data) => {
              //console.log('DATA! ', data);
              // the create fuction returns the newly created session obj
              // use the insertId to search our database and return the TextRow obj
              var id = data.insertId;
              return models.Sessions.get({id});
            })
            .then((sessionData)=> {
              //console.log('SESSION DATA: ', sessionData);
              // use this newly created session obj to set req and res as done above
              req.session = sessionData;
              res.cookie('shortlyid', req.session.hash);
              next();
            });
        }
        next();
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

