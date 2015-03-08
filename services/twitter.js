var _ = require('underscore');
var Promise = require('bluebird');
var Twit = require('twit');
var sentiment = require('./sentiment');

var twitter = {
  initialize: function(config) {
    config = config || {};

    if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
      throw new Error('Please set TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET enivronment vars.');
    }

    this.twit = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: config.ACCESS_TOKEN || process.env.TWITTER_DEMO_ACCESS_TOKEN,
      access_token_secret: config.ACCESS_TOKEN_SECRET || process.env.TWITTER_DEMO_ACCESS_TOKEN_SECRET
    });

    return this;
  },

  /**
   *  Returns a Bluebird promise
   */
  getTimeline: function(options, db) {
    options = options || {};

    var userId = options.userId || process.env.TWITTER_DEMO_USERID;
    var patientId = options.PATIENT_ID || process.env.DEMO_PATIENT_ID;

    return this._getLastTweetStoredId(process.env.TWITTER_DEMO_USERID, db)
      .bind(this)
      .then(function(lastTweetStoredId) {
        var queryOptions = lastTweetStoredId ? { userId: userId, since_id: lastTweetStoredId } : { userId: userId };

        return new Promise(function(resolve, reject) {
            this.twit.get('statuses/user_timeline', queryOptions, function(err, data, response) {
              if (err) { reject(err); }
              if (data.length && lastTweetStoredId === _.last(data).id) { data.pop(); }

              var tweets = data.map(function(tweet) {
                return _.pick(tweet, 'created_at', 'text', 'id');
              });

              resolve(tweets);
            });
          }.bind(this))
          .then(function(tweets) {
            var tweetsWithSentiment = tweets.map(function(tweet) {
              return Promise.props({
                type: 'twitter',
                social_user_uuid: userId,
                social_uuid: tweet.id,
                patient_id: patientId,
                created_at: tweet.created_at,
                text: tweet.text,
                sentiment: sentiment.analyze(tweet.text)
              });
            });

            return Promise.all(tweetsWithSentiment);
          });
      });
  },

  _getLastTweetStoredId: function(twitterUserId, db) {
    return new Promise(function(resolve, reject) {
        db.collection('sentiment').findOne({ social_user_uuid: twitterUserId, type: 'twitter' }, { sort: { social_uuid: -1 } }, function(err, result) {
          if (err) { reject(err); }

          var lastTweetStoredId = result ? result.social_uuid : 0;

          resolve(lastTweetStoredId);
        });
      });
  }
};

module.exports = function(config) {
  return twitter.initialize(config);
};
