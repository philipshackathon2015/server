var request = require('request-promise');

var sentiment = {
  baseURL: 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1',
  apiKey: process.env.HP_IDOL_API_KEY,
  analyze: function(text) {
    var url = this.baseURL + '?text=' + encodeURIComponent(text) + '&apiKey=' + this.apiKey;

    return request.get(url)
      .then(function(res) {
        return JSON.parse(res);
      });
  }
};

module.exports = sentiment;