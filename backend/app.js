const express = require("express");
const bodyParser = require("body-parser");
const DarkSky = require("dark-sky");
const darksky = new DarkSky("DARKSKY-API");
const redis = require("redis");
const client = redis.createClient();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, content-type"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.post("/api/coords", (req, res, next) => {
  try {
    console.log(req.body);
    //const { latitude, longitude } = req.body
    const hash_key = req.body.latitude;
    client.exists(hash_key, function (err, reply) {
      if (reply === 1) {
        console.log('exists');
        client.hgetall(req.body.latitude, function (err, response) {
          console.dir(response);
          res.status(200).json({
            response: response
          });
        });
      } else {
        console.log('doesn\'t exist');
        darksky
          .coordinates({lat: req.body.latitude, lng: req.body.longitude})
          .get()
          .then(function (forecast) {
            //console.log('forecast', forecast);
            client.hmset(
              hash_key,
              'timezone', forecast.timezone,
              'apparentTemperature', forecast.currently.apparentTemperature,
              'summary', forecast.currently.summary,
              'humidity', forecast.currently.humidity,
              'temperature', forecast.currently.temperature,
              'icon', forecast.currently.icon
            );
            res.status(200).json({
              response: {
                'timezone': forecast.timezone,
                'apparentTemperature': forecast.currently.apparentTemperature,
                'summary': forecast.currently.summary,
                'humidity': forecast.currently.humidity,
                'temperature': forecast.currently.temperature,
                'icon': forecast.currently.icon
              }
            });
          });
      }
    });
  } catch (err) {
    next(err)
  }
});

module.exports = app;
