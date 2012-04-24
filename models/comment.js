var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/tios_stage'
var client;
var sanitize = require('validator').sanitize;

var Stop = require('./stop');

client = new pg.Client(connectionString);
client.connect();

var Comment = exports = module.exports = function Comment(comment, stop, type, ip, nickname) {
  this.comment = comment;
  this.stop = stop;
  this.ip = ip;
  this.nickname = nickname;

  var types = [];
  var valid_types = ['weather', 'suggestion', 'look_for', 'just_sayin'];
  for (var i in type) {
    if (type[i] === 'on' && valid_types.indexOf(i) !== -1) {
      types.push(i);
    }
  }
  this.type = types;

  this.score = 0;
  this.time = new Date().getTime();
};

exports.get = function(id, fn){
  var query = client.query("SELECT comments.*, up.count AS up, down.count AS down, hidden.flag AS hidden FROM comments LEFT JOIN (SELECT * FROM comment_flags WHERE flag = 'hide') hidden on hidden.cid = comments.cid LEFT JOIN (SELECT cid, count(flag) FROM comment_flags WHERE flag = 'up' GROUP BY cid) up on up.cid = comments.cid LEFT JOIN (SELECT cid, count(flag) FROM comment_flags WHERE flag = 'down' GROUP BY cid) down on down.cid = comments.cid WHERE comments.cid = $1", [id]);
  var ret = new Comment();

  query.on('row', function(row) {
    for (var key in row) {
      if (undefined != row[key]) {
        if (key == 'type') {
          ret[key] = JSON.parse(row[key]);
        }
        else {
          ret[key] = row[key];
        }
      }
    }
    ret.hidden = row.hidden;
    ret.score = row.up - row.down;
  });
  query.on('end', function() {
    Stop.get(ret.stop, function(err, stop){
      ret.stop = stop;
      fn(null, ret);
    });
  });
};

exports.byStop = function(stop, fn) {
  var ret = [];
  //var today = new Date();
  //var weekAgo = new Date(today.getTime()-1000*60*60*24*7);
  query = client.query("SELECT comments.*, up.count AS up, down.count AS down FROM comments LEFT JOIN (SELECT * FROM comment_flags WHERE flag = 'hide') hidden on hidden.cid = comments.cid LEFT JOIN (SELECT cid, count(flag) FROM comment_flags WHERE flag = 'up' GROUP BY cid) up on up.cid = comments.cid LEFT JOIN (SELECT cid, count(flag) FROM comment_flags WHERE flag = 'down' GROUP BY cid) down on down.cid = comments.cid WHERE stop = $1 AND hidden IS null ORDER BY comments.time DESC LIMIT 40", [stop]);
  query.on('row', function(row) {
    row.score = row.up - row.down;
    row.stop = { stop_code: row.stop };
    var types = JSON.parse(row.type);
    row.type = types;
    ret.push(row);
  });
  query.on('end', function() {
    fn(ret);
  });
}

exports.recentComments = function(fn) {
  var ret = [];
  // query = client.query("SELECT * FROM comments WHERE time >= NOW() - '1 week'::INTERVAL");
  query = client.query("SELECT * FROM comments LIMIT 200");
  query.on('row', function(row) {
    var types = JSON.parse(row.type);
    row.type = types;
    ret.push(row);
    row.stop = { stop_code: row.stop };
  });
  query.on('end', function() {
    // todo: Should be doing a join instead.
    fn(ret);
  });
}

exports.all = function(fn) {
  var ret = [];
  query = client.query("SELECT comments.*, hidden.flag AS hidden, up.count AS up, down.count AS down FROM comments LEFT JOIN (SELECT * FROM comment_flags WHERE flag = 'hide') hidden on hidden.cid = comments.cid LEFT JOIN (SELECT cid, count(flag) FROM comment_flags WHERE flag = 'up' GROUP BY cid) up on up.cid = comments.cid LEFT JOIN (SELECT cid, count(flag) FROM comment_flags WHERE flag = 'down' GROUP BY cid) down on down.cid = comments.cid ORDER BY comments.time DESC");
  query.on('row', function(row) {
    row.score = row.up - row.down;
    row.stop = { stop_code: row.stop };
    var types = JSON.parse(row.type);
    row.type = types;
    ret.push(row);
  });
  query.on('end', function() {
    fn(ret);
  });
}

exports.flag = function(comment, flag, ip, fn) {
  var that = this;
  var valid_flags = ['up', 'down', 'report'];
  if (valid_flags.indexOf(flag) !== -1) {
    client.query('INSERT INTO comment_flags VALUES($1, $2, $3, $4) RETURNING cid', [comment.cid, flag, new Date(), ip], function() {
      that.get(comment.cid, fn);
    });
  }
  else {
    fn('Not a valid flag.');
  }
}

exports.flagAdmin = function(comment, flag, ip, fn) {
  var that = this;
  var valid_flags = ['hide', 'unhide', 'block'];
  if (valid_flags.indexOf(flag) !== -1) {
    if (flag === 'unhide') {
      client.query("DELETE FROM comment_flags WHERE cid = $1 AND flag = 'hide'", [comment.cid], function() {
        that.get(comment.cid, fn);
      });
    }
    else {
      client.query('INSERT INTO comment_flags VALUES($1, $2, $3, $4) RETURNING cid', [comment.cid, flag, new Date(), ip], function() {
        that.get(comment.cid, fn);
      });
    }
  }
  else {
    fn('Not a valid flag.');
  }
}

Comment.prototype.save = function(fn){
  var that = this;
  var cleanedUp = [sanitize(this.comment).xss(), sanitize(this.stop).toInt(), this.type, new Date(), this.ip, sanitize(this.nickname).xss()];
  var query = client.query('INSERT INTO comments (comment, stop, type, time, ip, nickname) VALUES($1, $2, $3, $4, $5, $6) RETURNING cid, time', cleanedUp);
  query.on('row', function(row) {
    that.cid = row.cid;
    that.time = new Date(row.time).toString();
  });
  query.on('end', function() {
    Stop.get(that.stop, function(err, stop){
      that.stop = stop;
      fn(null, that);
    });
    //if (typeof result === 'undefined') // Check for errors.
  });
}
