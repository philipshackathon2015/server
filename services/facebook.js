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

  getStatuses: function(options, db) {
    options = options || {};

    var profileId = options.PROFILE_ID || process.env.PROFILE_ID;
    var patientId = options.PATIENT_ID || process.env.DEMO_PATIENT_ID;

    return this._getLastFacebookStatusCreatedAtDate(process.env.PROFILE_ID, db)
      .bind(this)
      .then(function(lastFacebookStatusCreatedAtDate) {
        return new Promise(function(resolve, reject) {
          this.graph.get(profileId + "?fields=feed", function(err, graphRes) {
            if (err) { reject(err); }

            var data = graphRes.feed.data;
            var statuses = data.filter(function(post) {
              var isNewPost = new Date(post.created_time) > lastFacebookStatusCreatedAtDate;

              return post.message && post.from.id === profileId && isNewPost;
            });

            statuses = statuses.map(function(status) {
              return _.pick(status, 'id', 'message', 'created_time');
            });

            resolve(statuses);
          });
        }.bind(this));
      })
      .then(function(statuses) {
        var statusesWithSentiment = statuses.map(function(status) {
          return Promise.props({
            type: 'facebook',
            social_user_uuid: profileId,
            social_uuid: status.id,
            patient_id: patientId,
            created_at: status.created_time,
            text: status.message,
            sentiment: sentiment.analyze(status.message)
          });
        });

        return Promise.all(statusesWithSentiment);
      });
  },

  _getLastFacebookStatusCreatedAtDate: function(facebookUserId, db) {
    return new Promise(function(resolve, reject) {
        db.collection('sentiment').findOne({ social_user_uuid: facebookUserId, type: 'facebook' }, { sort: { created_at: -1 } }, function(err, result) {
          if (err) { reject(err); }

          var lastFacebookStatusCreatedAtDate = result ? result.created_at : 0;

          resolve(new Date(lastFacebookStatusCreatedAtDate));
        });
      });
  }
};

module.exports = function(config) {
  return facebook.initialize(config);
};