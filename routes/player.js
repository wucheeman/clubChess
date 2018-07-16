var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Player = require('../models/Player.js');

var passport = require('passport');
require('../config/passport')(passport);

/* GET ALL PLAYERS */
router.get('/', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    Player.find(function (err, players) {
      if (err) return next(err);
      res.json(players);
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

/* Create a player and save*/
router.post('/', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    Player.create(req.body, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
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