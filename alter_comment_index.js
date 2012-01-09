var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;
var count = 0;
var end = 0;

var endTest = function() {
  end++;
  if (end >= 2) {
    client.end();
  }
}

if (process.argv[2] == 'migrate') {
  client = new pg.Client(connectionString);
  client.connect();
  client.query("CREATE SEQUENCE comments_cid_seq;", function(err, result) {
    client.query("ALTER TABLE comments ADD cid INT UNIQUE;", function(err, result){
      client.query("ALTER TABLE comments ALTER COLUMN cid SET DEFAULT NEXTVAL('comments_cid_seq');", function(err, result) {
        client.query("ALTER TABLE comments ALTER COLUMN cid SET NOT NULL;", function(err, result) {
          client.query("ALTER TABLE comments DROP COLUMN id", function(err, result) {
            client.query("UPDATE comments SET cid = NEXTVAL('comments_cid_seq');", function(err, result) {
              client.end();
            });
          });
        });
      });
    });
  });
}
else if (process.argv[2] == 'test') {
  client = new pg.Client(connectionString);
  client.connect();
  var query = client.query("select * from INFORMATION_SCHEMA.COLUMNS where table_name = 'comments' and column_name = 'cid';");
  query.on('row', function(row) {
    console.log(row);
  });
  query.on('end', endTest);

  var sequence = client.query("select * from INFORMATION_SCHEMA.SEQUENCES");
  sequence.on('row', function(row) { 
    console.log(row);
  });
  sequence.on('end', endTest);
}

/*var query = client.query("ALTER TABLE comments ALTER COLUMN id SET DEFAULT nextval('comment_id')");
query.on('end', function() {
  client.end();
});*/