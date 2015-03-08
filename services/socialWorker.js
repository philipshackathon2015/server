var facebook = require('./facebook')();
var twitter = require('./twitter')();
var mongoLogger = require('./mongoLogger');

var socialWorker = {
  start: function(config, db) {
    config = config || {};

    var interval = config.interval || 10000;

    this.db = db;
    setInterval(function() {
      this._scrapeTwitter();
      this._scrapeFacebook();
    }.bind(this), interval);
  },

  _scrapeTwitter: function() {
    console.log('scraping twitter');
    twitter.getTimeline(null, this.db)
      .bind(this)
      .then(function(tweets) {
        if (tweets.length) {
          this.db.collection('sentiment').insert(tweets, mongoLogger);
        }
      })
      .catch(function(err) {
        console.log(err.stack);
      });
  },

  _scrapeFacebook: function() {
    console.log('scraping facebook');
    facebook.getStatuses(null, this.db)
      .bind(this)
      .then(function(statuses) {
        if (statuses.length) {
          this.db.collection('sentiment').insert(statuses, mongoLogger);
        }
      })
      .catch(function(err) {
        console.log(err.stack);
      });
  }
};

module.exports = socialWorker;