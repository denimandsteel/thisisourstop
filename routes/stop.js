var Stop = require('../models/stop');

module.exports = function(app) {
  app.get('/', function(req, res) {
  	// serve up home.
    res.end('you are welcome');
  });

  /**
   * Map :post to the database, loading
   * every time :post is present.
   */
  app.param('post', function(req, res, next, id){
    Stop.get(id, function(stop){
      console.log(stop);
      if (!stop) return next(new Error('failed to load post ' + id));
      req.stop = stop;
      next();
    });
  });

  app.get('/', function(req, res) {
  	// serve up home.
    res.end('you are welcome');
  });

  app.get('/post/:post.:format?', function(req, res) {
  	if(req.params.format === 'json') {
  		res.json(req.stop);	
  	}
  	else {
  		res.end('<h1>' + req.stop.id + ': ' + req.stop.description + '</h1>');
  	}
  });
};