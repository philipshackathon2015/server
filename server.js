var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var Promise = require('bluebird');
var twitter = require('./services/twitter')();
var sentiment = require('./services/sentiment');
var app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multer({dest: '/tmp/'}));

app.get('/', function(req, res) {
  res.json({ msg: 'Hello World!' });
});

app.get('/tweets', function(req, res) {
  twitter.getTimeline()
    .then(function(tweets) {
      res.json({ tweets: tweets });
    })
    .catch(function(err) {
      console.log(err.stack);
      res.json({ error: err.message });
    });
});

app.get('/sentiment', function(req, res) {
  sentiment.analyze('Hey, good job with that thing you did recently')
    .then(function(sentimentRes) {
      res.json(sentimentRes);
    })
    .catch(function(err) {
      console.log(err.stack);
      res.json({ error: err.message });
    });
});

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

