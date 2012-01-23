// Use with gtfsdb or raw csv.
if (process.argv[2] == 'pg') {
  var pg = require('pg').native;
  var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
  var client;
  var count = 0;

  client = new pg.Client(connectionString);
  client.connect();

  var query = client.query('SELECT * FROM stops');
  query.on('row', function(row) {
    client.query('INSERT INTO stop_routes (route_short_name, route_long_name,stop_code) SELECT DISTINCT routes.route_short_name, routes.route_long_name, stops.stop_code FROM stops LEFT JOIN stop_times ON stops.stop_id = stop_times.stop_id LEFT JOIN trips ON stop_times.trip_id = trips.trip_id LEFT JOIN routes ON trips.route_id = routes.route_id WHERE stops.stop_code = $1', [row.stop_code], function(err, result) {
      console.log(count + ' - ' + row.stop_code);
      count++;
    });
  });
  query.on('end', function() {
    client.end();
    console.log('All done: ' + count);
  });
}
else if (process.argv[2] == 'csv') {
  var loaded = 0;

  var stops = {};
  var stop_times = {};
  var trips = {};
  var routes = {};

  var pg = require('pg').native;
  var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
  var client;

  var stops_csv = require('csv')().fromPath('google_transit/stops.txt', { columns: true });
  var stop_times_csv = require('csv')().fromPath('google_transit/stop_times.txt', { columns: true });
  var trips_csv = require('csv')().fromPath('google_transit/trips.txt', { columns: true });
  var routes_csv = require('csv')().fromPath('google_transit/routes.txt', { columns: true });

  var migrate = function() {
    loaded++;
    if (loaded >= 4) {
      client = new pg.Client(connectionString);
      client.connect();
      client.query('DELETE FROM stop_routes');

      for (var id in stops) {
        var stop = stops[id];
        var times = stop_times[stop.stop_id];
        var trip = {};

        // Can either cache this ahead of time or actually make use of the times.
        var length = times.length;
        for (var j = 0; j < length; j++) {
          var route = routes[trips[times[j].trip_id].route_id];
          trip[route.route_short_name] = [route.route_short_name, route.route_long_name.replace(/^\s+|\s+$/g,""), id];
        }
        for (var k in trip) {
          client.query('INSERT INTO stop_routes VALUES($1, $2, $3)', trip[k]);
          if (trip[k][2] == '61612') {
            console.log(trip[k]);
          }
        }
      }
      //client.end(); -- dies early. Kill script manually for now.
    }
  }

  // Schema: stops(stop_code -> stop_id) -> stop_times(stop_id -> trip_id*) -> trips (trip_id -> route_id) -> routes

  stops_csv.on('data',function(data, index){
    stops[data.stop_code] = data;
  }).on('end', function(count){
    console.log('Number of stops: '+ count);
    migrate();
  });

  stop_times_csv.on('data',function(data, index){
    if (!stop_times[data.stop_id]) {
      stop_times[data.stop_id] = [];
    }
    stop_times[data.stop_id].push(data);
  }).on('end', function(count){
    console.log('Number of stop_times: '+count);
    migrate();
  });

  trips_csv.on('data',function(data, index){
    trips[data.trip_id] = data;
  }).on('end', function(count){
    console.log('Number of trips: '+count);
    migrate();
  });

  routes_csv.on('data',function(data, index){
    routes[data.route_id] = data;
  }).on('end',function(count){
    console.log('Number of routes: '+count);
    migrate();
  });
}
