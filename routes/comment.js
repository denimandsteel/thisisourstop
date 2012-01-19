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

  // All comments.
  app.get('/all.:format?', function(req, res) {
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

  // Individual comment info.
  app.get('/stop/:stop/comment/:comment.:format?', function(req, res) {
      if(req.params.format === 'json') {
        res.json({ comment: req.comment });
      }
      else {
        res.render('admin', { comments: req.comment });
      }
  });

  // Need more mods.
  app.get('/stop/:stop/comment/:comment/moderate/:verb.:format?', function(req, res) {
    if(req.params.format === 'json') {
        res.json({ comment: req.comment });
      }
      else {
        // Back where we came from.
        res.redirect('/stop/' + req.params.stop + '/#comment-' + req.comment.cid);
      }
  });

};
