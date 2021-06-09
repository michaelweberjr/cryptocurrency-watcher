const Session = require('../models/sessionModel');

const sessionController = {};

sessionController.startSession = async (req, res, next) => {
  if(res.locals.id) {
    session = await Session.findOne({ ssid: res.locals.id }).exec();

    if(!session) {
      Session.create({ ssid: res.locals.id }, (err, session) => {
        if(err) {
          return next({
            log: 'Error in sessionController.startSession: ' + err,
            message: 'Error in sessionController.startSession: internal server error, check the logs'
          });
        }
        else {
          res.cookie('ssid', res.locals.id), {
            httpOnly: true,
          };
          return next();
        }
      });
    }
    else {
      res.cookie('ssid', res.locals.id), {
        httpOnly: true,
      };
      return next();
    }
  }
  else return next();
};

sessionController.endSession = (req, res, next) => {
  if(!req.cookies.ssid) {
    return next({
      log: 'Error in sessionController.endSession: missing user id',
      message: 'Error in sessionController.endSession: internal server error, check the logs'
    });
  }
  else {
    Session.deleteOne({ ssid: req.cookies.ssid }, (err, session) => {
      if(err) {
        return next({
          log: 'Error in sessionController.endSession: ' + err,
          message: 'Error in sessionController.endSession: internal server error, check the logs'
        });
      }
      else {
        return next();
      }
    });
  }
};

sessionController.validateSession = (req, res, next) => {
  if(!req.cookies.ssid) {
    return next({
      log: 'Error in sessionController.validateSession: missing user id',
      message: 'Error in sessionController.validateSession: internal server error, check the logs'
    });
  }
  else {
    Session.findOne({ ssid: req.cookies.ssid }, (err, session) => {
      if(err) {
        return next({
          log: 'Error in sessionController.validateSession: ' + err,
          message: 'Error in sessionController.validateSession: internal server error, check the logs'
        });
      }
      else {
        if(session) {
          res.locals.id = session.ssid;
          console.log('Continue-ing session with ' + session.ssid);
        }
        return next();
      }
    });
  }
};

module.exports = sessionController;