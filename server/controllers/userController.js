const User = require('../models/userModel');

const userController = {};

userController.createUser = (req, res, next) => {
  if(!req.query.username || !req.query.password) {
    return next({
        status: 400,
        log: 'Error in authController.createUser: missing information in body of create user request',
        message: 'Error in authController.createUser: missing information in body of create user request'
    });
  }
  else {
    const { username, password } = req.query;
    User.findOne({username}).exec()
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

userController.validateUser = async (req, res, next) => {
  if(!req.query.username || !req.query.password) {
    return next({
        status: 400,
        log: 'Error in authController.validateUser: missing information in body of validate user request',
        message: 'Error in authController.validateUser: missing information in body of validate user request'
    });
  }
  else {
    const { username, password } = req.query;
    User.findOne({username}).exec()
      .then(async (data) => {
        if(data) {
          //   data.comparePassword(password, (err, matched) => {
          //   if (err) return next({
          //     log: 'Error in authController.validateUser: ' + err,
          //     message: 'Error in authController.validateUser: internal server error, check the logs'
          //   });
          //   else if (matched) {
          //     res.locals.id = data.id;
          //   }
          //   return next();
          // });
          if(data.password === password) {
            console.log('login successful');
            res.locals.id = data.id;
            res.locals.watchers = data.watchers;
          }
          return next();
        }
        else {
          return next();
        } 
      })
      .catch(err => next({
        log: 'Error in authController.validateUser: ' + err,
        message: 'Error in authController.validateUser: internal server error, check the logs'
      }));
  }
};

userController.getUser = (req, res, next) => {
  if(!res.locals.id) {
    return next();
  }
  else {
    User.findOne({_id:res.locals.id})
      .then(user => {
        if(user) {
          res.locals.tab = 0;
          res.locals.user = user;
        }
        return next();
      })
      .catch(err => next({
        log: 'Error in authController.getUser: ' + err,
        message: 'Error in authController.getUser: internal server error, check the logs'
      }));
  }
}

userController.updateUser = (req, res, next) => {
  res.locals.tab = 1;
  if(!res.locals.user) {
    return next();
  }
  else if(!Array.isArray(req.body)) {
    return next({
      status: 400,
      log: 'Error in authController.updateUser: request body most be a json array type',
      message: 'Error in authController.updateUser: request body most be a json array type'
    });
  }
  else if(req.body.some(w => typeof(w) !== 'string')) {
    return next({
      status: 400,
      log: 'Error in authController.updateUser: request body most be a json array with only strings',
      message: 'Error in authController.updateUser: request body most be a json array with only strings'
    });
  }
  else {
    res.locals.user.watchers = req.body;
    res.locals.user.save()
      .then(user => next())
      .catch(err => next({
        log: 'Error in authController.updateUser: ' + err,
        message: 'Error in authController.updateUser: internal server error, check the logs'
      }));
  }
}


module.exports = userController;
