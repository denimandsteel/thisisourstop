var Stop = require('../models/stop');
var Comment = require('../models/comment');

module.exports = function(app) {

  app.param('stop', function(req, res, next, id){
    Stop.get(id, function(err, stop){
      if (err) return next(err);
      if (!stop) return next(new Error('failed to find stop'));
      req.stop = stop;
      next();
    });
  });

  app.get('/', function(req, res) {
    res.end('<h1>This Is Our Stop</h1><form method="post" action="/"><input name="stop" type="text" /><input type="submit" /></form>');
  });

  app.post('/', function(req, res) {
    res.redirect('/stop/' + req.body.stop);
  });

  app.get('/stop/:stop.:format?', function(req, res) {
  	if(req.params.format === 'json') {
      Comment.byStop(req.stop.id, function(comments) {
        res.json({stop: req.stop, comments: comments}); 
      });
  	}
  	else {
      var ret = '';
      ret += '<h1>' + req.stop.id + ': ' + req.stop.description + '</h1><form method="post" action="/stop/' + req.stop.id + '"><textarea name="comment"></textarea><input type="submit" /></form>';
      Comment.byStop(req.stop.id, function(comments) {
        var length = comments.length;
        for (var i = 0; i < length; i++) {
          ret += '<div>' + comments[i].comment + '</div>';
        }
        res.end(ret);
      });
  	}
  });

  app.post('/stop/:stop.:format?', function(req, res) {
    var comment = new Comment(req.body.comment, req.stop.id);
    comment.save(function(err, savedComment){
      if (req.params.format === 'json') {
        res.json({ error: false, comment: savedComment });
      }
      else {
        res.redirect('/stop/' + req.stop.id);
      }
    });
  });

};