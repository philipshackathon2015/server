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
    return new Promise(function(resolve, reject) {
        this.graph.get(process.env.PROFILE_ID + "?fields=feed", function(err, graphRes) {
          if (err) { reject(err); }

          var data = graphRes.feed.data;
          var statuses = data.map(function(status) {
            return _.pick(status, 'message');
          });

          resolve(statuses);
        });
    }.bind(this))
    .then(function(statuses) {
      var statusesWithSentiment = statuses.map(function(status) {
        return Promise.props({
          message: status.message,
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