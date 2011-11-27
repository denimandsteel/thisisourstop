var express = require('express');
var app = module.exports = express.createServer();

// Mount hook
app.mounted(function(other){
  console.log('ive been mounted!');
});

app.set('jsonp callback', true);

// Middleware
app.configure(function(){
  app.use(express.logger('\x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m :response-time'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.favicon());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Routes
require('./routes/stop')(app);
//require('./routes/comment')(app);
//require('./routes/user')(app);

if (!module.parent) {
  app.listen(process.env.PORT || 3000);
  console.log('Express started!');
}