var Stop = require('../models/stop');
var Comment = require('../models/comment');

module.exports = function(app) {

  app.param('stop', function(req, res, next, id){
    Stop.get(id, function(err, stop){
      //if (err) return next(err);
      //if (!stop) return next(new Error('failed to find stop'));
      req.stop = stop;
      next();
    });
  });

  app.get('/', function(req, res) {
    res.render('stop');
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
      Comment.byStop(req.stop.id, function(comments) {
        res.render('stop/show', { stop: req.stop, comments: comments });
      });
  	}
  });

  app.post('/stop/:stop.:format?', function(req, res) {
    var comment = new Comment(req.body.comment, req.stop.id);
    // Validate.
    // Remove XSS input, only plain text is allowed.
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