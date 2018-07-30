var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');

var passport = require('passport');
require('../config/passport')(passport);

/* GET ALL USERS */
router.get('/', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.find(function (err, users) {
      if (err) return next(err);
      res.json(users);
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


router.post('/profile', function(req, res) {
  console.log(req.body);
  const updateObj = {};

  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (req.body.name !== '') {
    updateObj.name = req.body.name;
  }
    // TODO: remove when better validation is in place
  if (req.body.phonenum !== '' && phoneRegex.test(req.body.phonenum)) {
    console.log(phoneRegex.test(req.body.phonenum));
    updateObj.phonenum = req.body.phonenum;
  }
  if (req.body.status !== '') {
    updateObj.status = req.body.status;
  }
  User
    .findOneAndUpdate({ username: req.body.username }, {$set: updateObj }) // was {$set: req.body }
    .then(dbModel => res.json(dbModel))
    .catch(err => res.status(422).json(err));
});

// gets/extracts JWT token
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;