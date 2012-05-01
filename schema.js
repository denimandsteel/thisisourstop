var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client = new pg.Client(connectionString);

client.connect();
client.query("CREATE TABLE comments (comment text, stop integer, type text, \"time\" timestamp without time zone, cid serial, ip character varying, nickname character varying)", function(err, result) {
  client.query("CREATE TABLE comment_flags (cid integer NOT NULL, flag character varying, \"time\" timestamp with time zone, ip character varying, CONSTRAINT comment_flags_cid_fkey FOREIGN KEY (cid) REFERENCES comments (cid) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION)", function(err, result) {
    client.end();
  });
});
