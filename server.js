var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var Promise = require('bluebird');
var twitter = require('./services/twitter')();
var facebook = require('./services/facebook')();
var sentiment = require('./services/sentiment');
var app = express();
var https = require('https');
var graph = require('fbgraph');
// var passport = require('passport');
// var FacebookStrategy = require('passport-facebook').Strategy



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multer({dest: '/tmp/'}));

app.get('/', function(req, res) {
  res.json({ msg: 'Hello World!' });
});


// app.get('/get_feed', function(req, res) {

//   graph.get(user.id + "?fields=feed", function(err, res) {

//       res.send(res.feed.data[0]);
//     });
// });


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


app.get('/fb-statuses', function(req, res, next) {
  facebook.getStatuses()
    .then(function(statuses) {
      res.json(statuses);
    })
    .catch(function(err) {
      console.log(err.stack);
      res.json({ error: err.message });
    });
});

// app.get('/auth/facebook',
//   passport.authenticate('facebook', { scope: 'read_stream' })
//   // console.log(fuck);
// );

// app.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/login', display: 'touch' }),
//   function(req, res) {
//     console.log(res);
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

// app.get('/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });

// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     graph.setAccessToken(accessToken);

//     globalShit = accessToken;
//     // user.id = profile.id
//     var statusArray = [];
//     console.log(profile.id + ' profile id')
//     console.log(accessToken)
//     graph.get(profile.id + "?fields=feed", function(err, res) {
//       if (res.feed !== null) {
//         var feedArray = res.feed.data;
//         for( var key in feedArray) {

//           if(feedArray[key].type === 'status') {
//             statusArray.push(feedArray[key].message)
//           }
//         }
//         console.log({statuses: statusArray});
//       }
//     });
//     return statusArray;
//   }
// ));

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});


