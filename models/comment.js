var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;

client = new pg.Client(connectionString);
client.connect();

var Comment = exports = module.exports = function Comment(comment, stop, type) {
  this.id = new Date().getTime();
  this.comment = comment;
  this.stop = stop;
  this.type = type;
  this.time = new Date().getTime();
};

exports.get = function(id, fn){
  var query = client.query('SELECT * FROM comments WHERE id = $1', [id]);
  var ret = new Comment();
  query.on('row', function(row) {
    for (var key in row) {
      if (undefined != row[key]) {
        ret[key] = row[key];
      }
    }
  });
  query.on('end', function() {
    fn(ret);
  });
};

exports.byStop = function(stop, fn) {
  var date = new Date();
  var ret = [];
  query = client.query('SELECT * FROM comments WHERE stop = $1 ORDER BY time DESC', [stop]);
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
  var query = client.query('INSERT INTO comments VALUES($1, $2, $3, $4)', [this.comment, this.stop, this.type, new Date()]);
  query.on('end', function(result) {
    //if (typeof result === 'undefined') // Check for errors.
    fn(null, this);
  });
}
