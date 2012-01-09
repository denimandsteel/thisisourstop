var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;
var count = 0;
var end = 0;

client = new pg.Client(connectionString);
client.connect();

var tryEnd = function() {
  end++;
  console.log(end);
  if (end >= 2) {
    client.end();
  }
}

var query = client.query("select * from INFORMATION_SCHEMA.COLUMNS where table_name = 'comments' and column_name = 'id';");
query.on('row', function(row) {
  console.log(row);
});
query.on('end', tryEnd);

var sequence = client.query("select * from INFORMATION_SCHEMA.SEQUENCES");
sequence.on('row', function(row) { 
  console.log(row);
});
sequence.on('end', tryEnd);

/*var query = client.query("ALTER TABLE comments ALTER COLUMN id SET DEFAULT nextval('comment_id')");
query.on('end', function() {
  client.end();
});*/