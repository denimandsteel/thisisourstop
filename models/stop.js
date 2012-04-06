var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;

client = new pg.Client(connectionString);
client.connect();

// GTFS schema relation: stop_code -> stops(stop_code -> stop_id) -> stop_times(stop_id -> trip_id*) -> trips (trip_id -> route_id) -> routes(route_id)

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
          ret[key] = formatTitles(data[key]).replace('@', '<span class="minor">at</span>');
        }
      }
      // Slow and requires a lot of data up front.
      client.query("SELECT trips.trip_headsign, MIN(stop_times.arrival_time::INTERVAL - LOCALTIME) + now() as arrival_time FROM stops LEFT JOIN stop_times ON stops.stop_id = stop_times.stop_id LEFT JOIN trips ON stop_times.trip_id = trips.trip_id LEFT JOIN calendar ON trips.service_id = calendar.service_id WHERE CASE DATE_PART('dow', CURRENT_DATE) WHEN 0 THEN sunday = 't' WHEN 1 THEN monday = 't' WHEN 2 THEN tuesday = 't' WHEN 3 THEN wednesday = 't' WHEN 4 THEN thursday = 't' WHEN 5 THEN friday = 't' WHEN 6 THEN saturday = 't' END AND stop_times.arrival_time::INTERVAL > LOCALTIME AND stop_times.arrival_time::INTERVAL < (LOCALTIME + INTERVAL '2 hours') AND stop_code = $1 GROUP BY trips.trip_headsign ORDER BY arrival_time", [ret.stop_code], function(err, trip) {
        ret.trip = [];
        // Ugly... dirty data...
        for (var i = 0; i < trip.rows.length; i++) {
          var headsign = trip.rows[i].trip_headsign.match(/^([n1-9]{1,3}) (.+)$/i);
          var arrival = new Date(trip.rows[i].arrival_time);
          ret.trip[i] = {
            route_number: headsign[1],
            route_name: formatTitles(headsign[2]),
            arrival_time: arrival.getHours() % 12 + ':' + (arrival.getMinutes() < 10 ? '0' : '') + arrival.getMinutes(),
            arrive_soon: ((arrival.getMinutes() - (new Date()).getMinutes()) < 5 ? ' soon' : ''),
            night: headsign[1].indexOf("N") === 0 ? ' night' : ''
          }
          //ret.trip[i].route_short_name = trip.rows[i].route_short_name.replace(/^[0]+/g,''); // Remove leading zeros.
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
