var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var Promise = require('bluebird');
var sentiment = require('./services/sentiment');
var app = express();
var https = require('https');
var graph = require('fbgraph');
var MongoClient = require('mongodb').MongoClient;
var twitter = require('./services/twitter')();
var facebook = require('./services/facebook')();
var mongodb;
var sentimentCollection;
var sentimentInsertCallback = function(err, result) {
  if(err) {
    console.error('insert failed:',err);
  } else {
    console.log("Insert successful!");
  }
};

MongoClient.connect(process.env.MONGO_LAB_URL, function(err, db) {
  if(err) {
    console.error("connect to mongodb failed",err);
  } else {
    console.log("connected to mongo!");
    mongodb = db;
    sentimentCollection = mongodb.collection('sentiment');
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multer({dest: '/tmp/'}));

app.get('/', function(req, res) {
  res.json({ msg: 'Hello World!' });
});

app.get('/tweets', function(req, res) {
  twitter.getTimeline(null, mongodb)
    .then(function(tweets) {
      if (tweets.length) {
        sentimentCollection.insert(tweets, sentimentInsertCallback);
      }

      res.json({ tweets: tweets });
    })
    .catch(function(err) {
      console.log(err.stack);
      res.json({ error: err.message });
    });
});

app.get('/last-tweet', function(req, res) {
  sentimentCollection.findOne({}, { sort: {"social_uuid": -1} }, function(err, data) {
    res.json(data);
  });
});

app.get('/last-fb', function(req, res) {
  sentimentCollection.findOne({}, { sort: {"created_at": -1} }, function(err, data) {
    res.json(data);
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

app.get('/fb-statuses', function(req, res, next) {
  facebook.getStatuses(null, mongodb)
    .then(function(statuses) {
      if (statuses.length) {
        sentimentCollection.insert(statuses, sentimentInsertCallback);
      }
      res.json(statuses);
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


