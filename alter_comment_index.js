var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;
var count = 0;

client = new pg.Client(connectionString);
client.connect();

var query = client.query("ALTER TABLE comments ALTER COLUMN id SET DEFAULT nextval('comment_id')");
query.on('end', function() {
  client.end();
});