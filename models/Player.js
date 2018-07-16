var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({
  name: String,
  status: String,
});

module.exports = mongoose.model('Player', PlayerSchema);