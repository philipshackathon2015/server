module.exports = function(err, result) {
  if(err) {
    console.error('insert failed:', err);
  } else {
    console.log("insert successful!");
  }
};