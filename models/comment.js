var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;
var sanitize = require('validator').sanitize;

client = new pg.Client(connectionString);
client.connect();

var Comment = exports = module.exports = function Comment(comment, stop, type) {
  this.comment = comment;
  this.stop = stop;

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
  var query = client.query('SELECT * FROM comments WHERE cid = $1', [id]);
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
  });
  query.on('end', function() {
    fn(null, ret);
  });
};

exports.byStop = function(stop, fn) {
  var ret = [];
  var today = new Date();
  var weekAgo = new Date(today.getTime()-1000*60*60*24*7);
  query = client.query('SELECT * FROM comments WHERE stop = $1 AND time > $2 ORDER BY time DESC', [stop, weekAgo]);
  query.on('row', function(row) {
    var types = JSON.parse(row.type);
    row.type = types;
    ret.push(row);
  });
  query.on('end', function() {
    fn(ret);
  });
}

exports.all = function(fn) {
  var ret = [];
  query = client.query('SELECT * FROM comments ORDER BY time DESC');
  query.on('row', function(row) {
    var types = JSON.parse(row.type);
    row.type = types;
    ret.push(row);
  });
  query.on('end', function() {
    fn(ret);
  });
}

exports.moderate = function(fn) {
  var ret = [];
  query = client.query('SELECT * FROM comments ORDER BY time DESC');
  query.on('row', function(row) {
    var types = JSON.parse(row.type);
    row.type = types;
    ret.push(row);
  });
  query.on('end', function() {
    fn(ret);
  });
}

Comment.prototype.save = function(fn){
  var that = this;
  var query = client.query('INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING cid', [sanitize(this.comment).xss(), sanitize(this.stop).toInt(), this.type, new Date()]);
  query.on('row', function(row) {
    that.cid = row.cid;
  });
  query.on('end', function() {
    //if (typeof result === 'undefined') // Check for errors.
    fn(null, that);
  });
}
