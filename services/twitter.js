var _ = require('underscore');
var Promise = require('bluebird');
var Twit = require('twit');

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
  getTimeline: function(options) {
    options = options || {};

    var screename = options.screename || process.env.TWITTER_DEMO_SCREENNAME;

    return new Promise(function(resolve, reject) {
      this.twit.get('statuses/user_timeline', { screen_name: screename }, function(err, data, response) {
        if (err) { reject(err); }

        var tweets = data.map(function(tweet) {
          return _.pick(tweet, 'created_at', 'text');
        });

        resolve(tweets);
      });
    }.bind(this));
  }
};

module.exports = function(config) {
  return twitter.initialize(config);
};
