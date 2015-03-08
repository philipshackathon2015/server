module.exports = function(err, result) {
  if(err) {
    console.error('insert failed:', err);
    return;
  }

  console.log('insert successful!');

  var result = result[0];

  if (result.text) {
    console.log('text: ', result.text);
  }
  if (result.sentiment && result.sentiment.aggregate) {
    console.log('sentiment: ' + result.sentiment.aggregate.sentiment);
    console.log('sentiment score: ' + result.sentiment.aggregate.score);
  }
};