var Stop = require('../models/stop');
var Comment = require('../models/comment');

module.exports = function(app) {

  app.param('stop', function(req, res, next, id){
    Stop.get(id, function(err, stop){
      //if (err) return next(err);
      //if (!stop) return next(new Error('failed to find stop'));
      // Send 404...
      req.stop = stop;
      next();
    });
  });

  app.get('/', function(req, res) {
    res.render('stop');
  });

  app.get('/about', function(req, res) {
    res.render('about');
  });

  app.post('/', function(req, res) {
    res.redirect('/stop/' + req.body.stop);
  });

  app.get('/stop/:stop.:format?', function(req, res) {
    Comment.byStop(req.stop.id, function(comments) {
      if(req.params.format === 'json') {
        res.json({stop: req.stop, comments: comments}); 
      }
      else {
        res.render('stop/show', { stop: req.stop, comments: comments });
      }
    });
  });

  app.get('/stop/:stop/new', function(req, res) {
    res.render('stop/new', { stop: req.stop });
  });

  app.post('/stop/:stop.:format?', function(req, res) {
    var types = [];
    var valid_types = ['weather', 'suggestion', 'look_for', 'just_sayin'];
    for (var i in req.body.type) {
      if (req.body.type[i] === 'on' && valid_types.indexOf(i) !== -1) {
        types.push(i);
      }
    }
    var comment = new Comment(req.body.comment, req.stop.id, types);
    // todo: Fully validate and remove XSS input, only plain text is allowed.
    comment.save(function(err, savedComment){
      if (req.params.format === 'json') {
        res.json({ error: false, comment: savedComment });
      }
      else {
        res.redirect('/stop/' + req.stop.id + '/#talk');
      }
    });
  });

};