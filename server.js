// server.js
// where your node app starts

// init project
var util = require('util');
var _ = require('underscore');
var express = require('express');
var coex = require('co-express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var nunjucks = require('nunjucks');

var app = express();
var db, polls;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

nunjucks.configure('views', {express: app});
app.set('view engine', 'njk');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.render('index');
});

app.post('/polls', coex(function * (request, response) {
  var attrs = _.pick(request.body, 'name');
  console.log('create poll, attrs: ' + util.inspect(attrs));

  var result = yield polls.insertOne(attrs);
  response.redirect('/polls/' + result.insertedId);
}));

app.get('/polls/:id', coex(function * (request, response) {
  var id = mongodb.ObjectId(request.params.id);
  var results = yield polls.find({_id: id}).limit(1).toArray();
  var poll = results[0];
  console.log('found poll: ' + util.inspect(poll));
  response.render('poll', {poll: poll});
}));

app.put('/polls/:id', coex(function * (request, response) {
  var id = mongodb.ObjectId(request.params.id);
  var attrs = _.pick(request.body, 'name', 'options');
  attrs._id = id;
  var result = yield polls.findOneAndUpdate({_id: id}, attrs, {returnOriginal: false});
  response.json(result.value);
}));

var uri = process.env.MONGODB_URI;
mongodb.MongoClient.connect(uri, function(error, connection) {
  if (error) throw error;
  console.log('Connected to db at ' + uri);
  db = connection;
  polls = db.collection('polls');

  var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });
});
