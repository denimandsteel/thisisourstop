var comments = require('dirty')('comments.dirty');

var Comment = exports = module.exports = function Comment(comment, stop, type) {
  this.id = new Date().getTime();
  this.comment = comment;
  this.stop = stop;
  this.type = type;
  this.time = new Date().getTime();
};

exports.get = function(id, fn){
  var data = comments.get(id);
  var ret = new Comment();
  for (var key in data) {
    if (undefined != data[key]) {
      ret[key] = data[key];
    }
  }
  fn(ret);
};

exports.byStop = function(stop, fn) {
	var ret = [];
	comments.forEach(function(key, val) {
    if (val.stop == stop) {
    	ret.push(val);
    }
  });
  fn(ret.reverse());
}

Comment.prototype.save = function(fn){
  comments.set(this.id, this, fn(null, this));
};