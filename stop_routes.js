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