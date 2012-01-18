var Comment = require('../models/comment');

var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;

client = new pg.Client(connectionString);
client.connect();

module.exports = function(app) {

  app.param('comment', function(req, res, next, cid){
    Comment.get(cid, function(err, comment){
      if (err === null) {
        req.comment = comment;
        next();
      }
      else {
        next(err); 
      }
    });
  });

  app.get('/admin.:format?', function(req, res) {
    client.query('SELECT * FROM comments', function(err, result) {
      Comment.all(function(comments) {
        if(req.params.format === 'json') {
          res.json({ comments: comments }); 
        }
        else {
          res.render('admin', { comments: comments });
        }
      });
    });
  });

  app.get('/comment/:comment.:format?', function(req, res) {
      if(req.params.format === 'json') {
        res.json({ comment: req.comment }); 
      }
      else {
        res.render('admin', { comments: req.comment });
      }
  });

  app.post('/comment/:comment/:action.:format?', function(req, res) {
      /*
      if(req.params.format === 'json') {
        res.json({ comment: req.comment }); 
      }
      else {
        res.render('admin', { comments: req.comment });
      }
      */
  });

};