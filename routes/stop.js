var Stop = require('../models/stop');
var Comment = require('../models/comment');
var sio = require('socket.io');
var fs = require('fs');

// Keep in memory.
var comment_template = null;

fs.readFile('views/comment.ejs', function(error, content) {
  comment_template = content;
});

module.exports = function(app) {
  var io = sio.listen(app);

  app.param('stop', function(req, res, next, id){
    Stop.get(id, function(err, stop){
      if (err === null) {
        req.stop = stop;
        next();
      }
      else {
        res.redirect('/404');
      }
    });
  });

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

  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/desktop', function(req, res) {
    Comment.recentComments(function(comments) {
      var markers = [];
      var length = comments.length;
      // DIIIIRRRRRTYYYY.
      for (var i = 0; i < length; i++) {
        if (i === length - 1) {
          Stop.getShort(comments[i].stop.stop_code, function(err, stop) {
            //console.log({ stop_lat: stop.stop_lat, stop_lon: stop.stop_lon });
            markers.push({ stop_lat: stop.stop_lat, stop_lon: stop.stop_lon });
            res.render('desktop', { recentMarkers: JSON.stringify(markers)});
          });
        }
        else {
          Stop.getShort(comments[i].stop.stop_code, function(err, stop) {
            //console.log({ stop_lat: stop.stop_lat, stop_long: stop.stop_lon });
            markers.push({ stop_lat: stop.stop_lat, stop_lon: stop.stop_lon });
          });
        }
      }
    });
  });

  app.get('/about', function(req, res) {
    res.render('index');
  });

  app.get('/how', function(req, res) {
    res.render('index');
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

  if (process.env.NODE_ENV == 'production') {
    io.set('log level', 1);
  }
  io.sockets.on('connection', function (socket) {
    socket.on('new', function(data) {
      var comment = new Comment(data.comment, data.stop, data.types, socket.handshake.address.address, data.nickname);
      comment.save(function(err, savedComment){
        io.sockets.emit('comment', { comment: savedComment });
        io.sockets.emit('stop/' + savedComment.stop.stop_code, { comment: savedComment });
      });
    });
  });

  app.post('/stop/:stop.:format?', function(req, res) {
    var comment = new Comment(req.body.comment, req.stop.id, req.body.type);
    // todo: Fully validate and remove XSS input, only plain text is allowed.
    comment.save(function(err, savedComment){
      io.sockets.emit('comment', { comment: savedComment });
      io.sockets.emit('stop/' + savedComment.stop.stop_code, { comment: savedComment });
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

  // Individual comment info.
  app.get('/stop/:stop/comment/:comment.:format?', function(req, res) {
      if(req.params.format === 'json' || req.xhr) {
        res.json({ comment: req.comment });
      }
      else {
        res.render('admin', { comments: req.comment });
      }
  });

  // Need more mods.
  app.get('/stop/:stop/comment/:comment/flag/:flag.:format?', function(req, res) {
    Comment.flag(req.comment, req.params.flag, req.connection.remoteAddress, function(err, savedComment) {
      if(req.params.format === 'json' || req.xhr) {
        if (err === null) {
          res.json({ comment: savedComment });
        }
        else {
          res.json({ error: true, message: err });
        }
      }
      else {
        // Back where we came from.
        res.redirect('/stop/' + req.params.stop + '/#comment-' + req.comment.cid);
      }
    });
  });

  // Basic auth middleware for admin pages: http://node-js.ru/3-writing-express-middleware
  function basic_auth (req, res, next) {
    if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
      if (new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString() == (process.env.TIOS_ADMIN || 'admin:password')) {
        next();
        return;
      }
    }
    res.header('WWW-Authenticate', 'Basic realm="Admin Area"');
    if (req.headers.authorization) {
      // Stop
      setTimeout(function () {
        res.send('Authentication required', 401);
      }, 5000);
    }
    else {
      res.send('Authentication required', 401);
    }
  }

  // All comments.
  app.get('/admin/moderate.:format?', basic_auth, function(req, res) {
    Comment.all(function(comments) {
      if(req.params.format === 'json' || req.xhr) {
        res.json({ comments: comments });
      }
      else {
        Comment.recentComments(function(recentComments) {
          var markers = [];
          var length = recentComments.length;
          // DIIIIRRRRRTYYYY. Oh well, this is only for admins.
          for (var i = 0; i < length; i++) {
            if (i === length - 1) {
              Stop.getShort(recentComments[i].stop.stop_code, function(err, stop) {
                markers.push({ stop_lat: stop.stop_lat, stop_lon: stop.stop_lon });
                res.render('admin/moderate', { comments: comments, recentMarkers: JSON.stringify(markers), page_id: 'admin', comment_template: comment_template });
              });
            }
            else {
              Stop.getShort(comments[i].stop.stop_code, function(err, stop) {
                markers.push({ stop_lat: stop.stop_lat, stop_lon: stop.stop_lon });
              });
            }
          }
        });
      }
    });
  });

  // Need more mods.
  app.get('/admin/moderate/:stop/comment/:comment/flag/:flag.:format?', basic_auth, function(req, res) {
    Comment.flagAdmin(req.comment, req.params.flag, req.connection.remoteAddress, function(err, savedComment) {
      if(req.params.format === 'json' || req.xhr) {
        if (err === null) {
          res.json({ comment: savedComment });
        }
        else {
          res.json({ error: true, message: err });
        }
      }
      else {
        // Back where we came from.
        res.redirect('/admin/moderate#comment-' + req.comment.cid);
      }
    });
  });

};
