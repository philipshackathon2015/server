var _ = require('underscore');
var graph = require('fbgraph');
var Promise = require('bluebird');
var sentiment = require('./sentiment');

var facebook = {
  initialize: function(config) {
    config = config || {};
    this.graph = graph;
    this.graph.setAccessToken(config.ACCESS_TOKEN || process.env.FB_ACCESS_TOKEN);

    return this;
  },

  getStatuses: function(options) {
    options = options || {};

    var profileId = options.PROFILE_ID || process.env.PROFILE_ID;

    return new Promise(function(resolve, reject) {
        this.graph.get(profileId + "?fields=feed", function(err, graphRes) {
          if (err) { reject(err); }

          var data = graphRes.feed.data;
          var statuses = data.filter(function(post) {
            return post.message && post.from.id === profileId;
          });

          statuses = statuses.map(function(status) {
            return _.pick(status, 'message', 'created_time');
          });

          resolve(statuses);
        });
    }.bind(this))
    .then(function(statuses) {
      var statusesWithSentiment = statuses.map(function(status) {
        return Promise.props({
          created_at: status.created_time,
          text: status.message,
          sentiment: sentiment.analyze(status.message)
        });
      });

      return Promise.all(statusesWithSentiment);
    });
  }
};

module.exports = function(config) {
  return facebook.initialize(config);
};