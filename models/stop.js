var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;

client = new pg.Client(connectionString);
client.connect();

 // Schema: stops(stop_code -> stop_id) -> stop_times(stop_id -> trip_id*) -> trips (trip_id -> route_id) -> routes

var Stop = exports = module.exports = function Stop(id) {
  this.id = id;
};

exports.get = function(id, fn){
  client.query('SELECT * FROM stops WHERE stop_code = $1', [id], function(err, result) {
    if (result.rows.length > 0) {
      var ret = new Stop(id);
      var data = result.rows[0];
      for (var key in data) {
        if (undefined != data[key]) {
          ret[key] = data[key];
        }
        // Ugly... dirty data...
        if (key == 'stop_desc') {
          ret[key] = formatTitles(data[key]);
        }
      }
      // Slow and requires a lot of data up front.
      client.query('SELECT * from stop_routes WHERE stop_code = $1 ORDER BY route_short_name', [ret.stop_code], function(err, trip) {
        ret.trip = trip.rows;
        // Ugly... dirty data...
        for (var i = 0; i < trip.rows.length; i++) {
          ret.trip[i].route_long_name = formatTitles(trip.rows[i].route_long_name);
        }
        fn(null, ret);
      });
    }
    else {
      fn('No such stop.');
    }
  });

  var formatTitles = function(str) {
    return str.toLowerCase().replace(/\w/, function($0) { return $0.toUpperCase(); });
  }
};