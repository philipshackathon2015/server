var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var https = require('https');
var passport = require('passport');
var graph = require('fbgraph');
var FacebookStrategy = require('passport-facebook').Strategy


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multer({dest: '/tmp/'}));

app.get('/', function(req, res) {
  // res.json({ msg: 'Hello World!' });
  res.json(globalShit);
});

app.get('/login', function(req, res) {
  res.json({ msg: 'try again!' });
});

// app.get('/get_feed', function(req, res) {

//   graph.get(user.id + "?fields=feed", function(err, res) {

//       res.send(res.feed.data[0]);
//     });
// });



app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});


app.get('/facebook/statuses', function(req, res, next) {
  graph.setAccessToken(process.env.FB_ACCESS_TOKEN);
  var statusArray = [];
  graph.get(process.env.PROFILE_ID + "?fields=feed", function(err, graphRes) {
      if (graphRes.feed !== null) {
        var feedArray = graphRes.feed.data;
        for( var key in feedArray) {

          if(feedArray[key].type === 'status') {
            statusArray.push(feedArray[key].message)
          }
        }
        res.json({statuses: statusArray});
      }
    });
});

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: 'read_stream' })
  // console.log(fuck);
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', display: 'touch' }),
  function(req, res) {
    console.log(res);
    // Successful authentication, redirect home.
    res.redirect('/');
  });


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    graph.setAccessToken(accessToken);

    globalShit = accessToken;
    // user.id = profile.id
    var statusArray = [];
    console.log(profile.id + ' profile id')
    console.log(accessToken)
    graph.get(profile.id + "?fields=feed", function(err, res) {
      if (res.feed !== null) {
        var feedArray = res.feed.data;
        for( var key in feedArray) {

          if(feedArray[key].type === 'status') {
            statusArray.push(feedArray[key].message)
          }
        }
        console.log({statuses: statusArray});
      }
    });
    return statusArray;
  }
));

