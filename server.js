const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
var logger = require('morgan');

var player = require('./routes/player');
var auth = require('./routes/auth');

const PORT = process.env.PORT || 3001;
const app = express();

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chessclubdb',
                  { promiseLibrary: require('bluebird') })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));


// Define middleware here

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'build')));


// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Define API routes here
app.use('/api/player', player);
app.use('/api/auth', auth);



// TODO uncomment when moved to react-router
// Send every other request to the React app
// Define any API routes before this runs
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./client/build/index.html"));
// });


app.listen(PORT, () => {
  console.log(`🌎 ==> Server now on port ${PORT}!`);
});
