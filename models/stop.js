var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;

client = new pg.Client(connectionString);
client.connect();

 // Schema: stops(stop_code -> stop_id) -> stop_times(stop_id -> trip_id*) -> trips (trip_id -> route_id) -> routes

var Stop = exports = module.exports = function Stop(id) {
  this.id = id;
};

exports.all = function(fn) {
  var ret = {};
  query = client.query('SELECT distinct stops.stop_code, stop_desc, stop_lat, stop_lon, route_short_name, route_long_name from stops left join stop_routes on stops.stop_code = stop_routes.stop_code');
  query.on('row', function(row) {
    var trip = {
      route_short_name: row.route_short_name,
      route_long_name: row.route_long_name
    };
    if (typeof ret[row.stop_code] === 'undefined') {
      ret[row.stop_code] = {
        stop_desc: row.stop_desc,
        stop_lat: row.stop_lat,
        stop_lon: row.stop_lon,
        trips: [trip]
      };
    }
    else {
      ret[row.stop_code].trips.push(trip);
    }
  });
  query.on('end', function() {
    fn(ret);
  });
}

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
          ret[key] = formatTitles(data[key]).replace('@', '<span class="minor">at</span>');
        }
      }
      // Slow and requires a lot of data up front.
      client.query('SELECT distinct route_short_name, route_long_name from stop_routes WHERE stop_code = $1 ORDER BY route_short_name', [ret.stop_code], function(err, trip) {
        ret.trip = trip.rows;
        // Ugly... dirty data...
        for (var i = 0; i < trip.rows.length; i++) {
          ret.trip[i].route_long_name = formatTitles(trip.rows[i].route_long_name);
          ret.trip[i].route_short_name = trip.rows[i].route_short_name.replace(/^[0]+/g,'');
          ret.trip[i].night = trip.rows[i].route_short_name.indexOf("N") === 0 ? ' night' : '';
        }
        fn(null, ret);
      });
    }
    else {
      fn('No such stop.');
    }
  });

  // We have some seriously ugly data from Translink, let's make it nicer.
  // Extended from: http://ejohn.org/blog/title-capitalization-in-javascript/
  var formatTitles = function(str) {
    var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
    var big = "(UBC|VCC|BCIT|SFU)";
    var correct = {
      'Bdry': 'Boundary',
      'Bway': 'Broadway',
      'Gran': 'Granville',
      'Av': 'Ave',
      'Cntrl': 'Central',
      'Exch': 'Exchange',
      'Ex': 'Exchange',
      'Cap': 'Capilano',
      'U': 'University',
      'Van': 'Vancouver',
      'Coq': 'Coquitlam',
      'Mdws': 'Meadows',
      'Rvr': 'River',
      'Stat': 'Stn',
    }
    // Get keys for use in regex.
    var correct_keys = [];
    for (var key in correct) {
      if(Object.prototype.hasOwnProperty.call(correct, key)) {
        correct_keys.push(key);
      }
    }

    var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

    this.titleCaps = function(title){
      var parts = [],
          split = /[:.;?!] |(?: |^)["Ò]/g,
          index = 0;

      while (true) {
        var m = split.exec(title);

        parts.push(title
          .toLowerCase()
          .substring(index, m ? m.index : title.length)
          .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
            return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
          })
          .replace(RegExp("\\b" + small + "\\b", "ig"), function(word) {
            return word.toLowerCase();
          })
          .replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
            return punct + upper(word);
          })
          .replace(RegExp("\\b" + small + punct + "$", "ig"), upper)
        );

        index = split.lastIndex;

        if (m) {
          parts.push(m[0]);
        }
        else {
          break;
        }
      }

      return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
        .replace(/(['Õ])S\b/ig, "$1s")
        .replace(RegExp("\\b(" + correct_keys.join("|") + ")\\b", "ig"), function(all) {
          return correct[all];
        })
        .replace(RegExp("\\b" + big + "\\b", "ig"), function(all){
          return all.toUpperCase();
        });
    };

    function upper(word){
      return word.substr(0,1).toUpperCase() + word.substr(1);
    }
    return this.titleCaps(str);
  }
};
