var stops = {};
var stop_times = {};
var trips = {};
var routes = {};

var stops_csv = require('csv')().fromPath('google_transit/stops.txt', { columns: true });
var stop_times_csv = require('csv')().fromPath('google_transit/stop_times.txt', { columns: true });
var trips_csv = require('csv')().fromPath('google_transit/trips.txt', { columns: true });
var routes_csv = require('csv')().fromPath('google_transit/routes.txt', { columns: true });

 // Schema: stops(stop_code -> stop_id) -> stop_times(stop_id -> trip_id*) -> trips (trip_id -> route_id) -> routes

stops_csv.on('data',function(data, index){
  stops[data.stop_code] = data;
}).on('end',function(count){
  console.log('Number of stops: '+count);
});

stop_times_csv.on('data',function(data, index){
  if (!stop_times[data.stop_id]) {
    stop_times[data.stop_id] = [];
  }
  stop_times[data.stop_id].push(data);
}).on('end',function(count){
  // If we don't actually use this (if we cache routes by stop), then free up memory.
  console.log('Number of stop_times: '+count);
});

trips_csv.on('data',function(data, index){
  trips[data.trip_id] = data;
}).on('end',function(count){
  console.log('Number of trips: '+count);
});

routes_csv.on('data',function(data, index){
  routes[data.route_id] = data;
}).on('end',function(count){
  console.log('Number of routes: '+count);
});

var Stop = exports = module.exports = function Stop(id) {
  this.id = id;
};

exports.get = function(id, fn){
  var stop = stops[id];
  var times = stop_times[stop.stop_id];
  var trip = [];

  // Can either cache this ahead of time or actually make use of the times.
  var length = times.length;
  for (var i = 0; i < length; i++) {
    trip.push(trips[times[i].trip_id].trip_headsign);
  }
  var data = { stop: stop, trip: trip };

  if (!data) fn('No such stop.');
  var ret = new Stop(id);
  for (var key in data) {
    if (undefined != data[key]) {
      ret[key] = data[key];
    }
  }
  fn(null, ret);
};