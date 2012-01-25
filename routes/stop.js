var Stop = require('../models/stop');
var Comment = require('../models/comment');
var sio = require('socket.io');
var fs = require('fs');

var comment_template = null;

fs.readFile('views/comment.ejs', function(error, content) {
  comment_template = content;
});

module.exports = function(app) {
  var io = sio.listen(app);
  io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
  });

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
    res.render('index');
  });

  app.get('/about', function(req, res) {
    res.render('about');
  });

  app.get('/how', function(req, res) {
    res.render('how');
  });

  app.post('/', function(req, res) {
    res.redirect('/stop/' + req.body.stop);
  });

  app.get('/stop/:stop.:format?', function(req, res) {
    Comment.byStop(req.stop.id, function(comments) {
      if(req.params.format === 'json' || req.xhr) {
        res.json({stop: req.stop, comments: comments});
      }
      else {
        res.render('stop', { stop: req.stop, comments: comments, comment_template: comment_template });
      }
    });
  });

  io.sockets.on('connection', function (socket) {
    socket.on('new', function(data) {
      var comment = new Comment(data.comment, data.stop, data.types);
      comment.save(function(err, savedComment){
        io.sockets.emit('comment', { comment: savedComment });
        io.sockets.emit('stop/' + savedComment.stop, { comment: savedComment });
      });
    });
  });

  app.post('/stop/:stop.:format?', function(req, res) {
    var comment = new Comment(req.body.comment, req.stop.id, req.body.type);
    // todo: Fully validate and remove XSS input, only plain text is allowed.
    comment.save(function(err, savedComment){
      io.sockets.emit('comment', { comment: savedComment });
      io.sockets.emit('stop/' + savedComment.stop, { comment: savedComment });
      if (req.params.format === 'json' || req.xhr) {
        res.json({ error: false, comment: savedComment });
      }
      else {
        var hash = '';
        if (typeof savedComment.cid !== 'undefined') {
          hash = '#comment-' + savedComment.cid;
        }
        res.redirect('/stop/' + req.stop.id + hash);
      }
    });
  });

};
