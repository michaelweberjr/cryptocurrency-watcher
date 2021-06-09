const models = require('../models/userModel');

const authController = {};

authController.createUser = (req, res, next) => {
  if(!req.body.username || !req.body.password) {
    return next({
        status: 400,
        log: 'Error in authController.createUser: missing information in body of create user request',
        message: 'Error in authController.createUser: missing information in body of create user request'
    });
  }
  else {
    const { username, password } = req.body;
    models.User.findOne({username})
      .then(data => {
        if(!data) {
          User.create({ username, password, watchers:[] }, (err, user) => {
            if(err) return next({
              log: 'Error in authController.createUser: ' + err,
              message: 'Error in authController.createUser: internal server error, check the logs'
            });
            else {
              res.locals.id = user.id;
              return next();
            }
          });
        }
        else return next();
      })
      .catch(err => next({
        log: 'Error in authController.createUser: ' + err,
        message: 'Error in authController.createUser: internal server error, check the logs'
      }));
  }
};

authController.validateUser = (req, res, next) => {
  if(!req.body.username || !req.body.password) {
    return next({
        status: 400,
        log: 'Error in authController.validateUser: missing information in body of validate user request',
        message: 'Error in authController.validateUser: missing information in body of validate user request'
    });
  }
  else {
    const { username, password } = req.body;
    models.User.findOne({username})
      .then(data => {
        if(data) {
          data.comparePassword(password, (err, matched) => {
            if (err) return next({
              log: 'Error in authController.validateUser: ' + err,
              message: 'Error in authController.validateUser: internal server error, check the logs'
            });
            else if (matched) {
              res.locals.id = data.id;
            }
            return next();
          });
        }
        else return next();
      })
      .catch(err => next({
        log: 'Error in authController.validateUser: ' + err,
        message: 'Error in authController.validateUser: internal server error, check the logs'
      }));
  }
};

module.exports = authController;
