var sentiment = require('./sentiment');

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;


var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(function(d) { return y(d.low); })
    .y1(function(d) { return y(d.high); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var moodData = [{
    "_id": {
        "$oid": "54fbbed609cc158c9dca2848"
    },
    "type": "twitter",
    "social_user_uuid": "3067363386",
    "social_uuid": 574400555797209090,
    "patient_id": "Patient/a103",
    "created_at": "Sun Mar 08 02:45:39 +0000 2015",
    "text": "I am determined to be cheerful and happy in whatever situation I may find myself.",
    "sentiment": {
        "positive": [
            {
                "sentiment": "determined",
                "topic": null,
                "score": 0.7176687736973063,
                "original_text": "I am determined",
                "original_length": 15,
                "normalized_text": "I am determined",
                "normalized_length": 15
            },
            {
                "sentiment": "cheerful and happy",
                "topic": null,
                "score": 0.7849078927708399,
                "original_text": "be cheerful and happy",
                "original_length": 21,
                "normalized_text": "be cheerful and happy",
                "normalized_length": 21
            }
        ],
        "negative": [],
        "aggregate": {
            "sentiment": "positive",
            "score": 0.7512883332340732
        }
    }
}]

function getMonth(passedMonth) {
  var currentMonth = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(passedMonth) / 3 + 1
  return currentMonth.length == 2 ? currentMonth : "0" + currentMonth;
}

function parseTwitterdate(date) {
  var year = date.match(/[^+](\d{4})/)[1];
  var month = getMonth(date.match(/(\w{3}) (\d{2}) /)[1])
  var day = date.match(/(\w{3}) (\d{2}) /)[2]
  return year + month + day;

}

function createGraph() {
  moodData.forEach(function(d) {

    // console.log(parseTwitterdate(d.created_at));
    d.day = parseDate(parseTwitterdate(d.created_at));
    // console.log(d.day)

    if (d.sentiment.aggregate.sentiment === "positive") {
      d.high = d.sentiment.aggregate.score;
      d.low = 0.5;
      console.log(d.high)
      console.log(d.low)
    }
    else {
      d.high = 0.5;
      d.low = d.sentiment.aggregate.score;
      console.log(d.high)
      console.log(d.low)
    }


    x.domain(d3.extent(moodData, function(d) { return d.date; }));
    y.domain([d3.min(moodData, function(d) { return d.low; }), d3.max(moodData, function(d) { return d.high; })]);

    svg.append("path")
        .datum(moodData)
        .attr("class", "area")
        .attr("moodData", area);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Sentiment (ºGB)");
  });
}

