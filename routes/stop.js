var Stop = require('../models/stop');
var Comment = require('../models/comment');
var sio = require('socket.io');

module.exports = function(app) {
  var io = sio.listen(app);

  app.param('stop', function(req, res, next, id){
    Stop.get(id, function(err, stop){
      //if (err) return next(err);
      //if (!stop) return next(new Error('failed to find stop'));
      // Send 404...
      if (err === null) {
        req.stop = stop;
        next();
      }
      else {
        next(err);
       // console.log('and this is right too?');
       // next(new Error('failed to find stop'));
        //next(new Error(err));
        //res.send(404);
        //res.render('stop');
      }
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
    var comment = new Comment(req.body.comment, req.stop.id, req.body.type);
    // todo: Fully validate and remove XSS input, only plain text is allowed.
    comment.save(function(err, savedComment){
      // Render HTML on server side... bit of a hack but don't feel like sharing templates on client side yet.
      res.partial('comment', [savedComment], function(err, html) {
        io.sockets.emit('comment', {'html': html});
      });
      if (req.params.format === 'json') {
        res.json({ error: false, comment: savedComment });
      }
      else {
        var hash = '';
        if (typeof savedComment.cid !== 'undefined') {
          hash = '/#comment-' + savedComment.cid;
        }
        res.redirect('/stop/' + req.stop.id + hash);
      }
    });
  });

};