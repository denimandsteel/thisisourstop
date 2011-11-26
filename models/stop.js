var dirty = require('dirty')('stops.dirty');

var Stop = exports = module.exports = function Stop(id, description) {
  this.id = id;
  this.description = description;
};

// dirty.set(123, {description: '123 Broadway'});

exports.get = function(id, fn){
  var data = dirty.get(id);
  var ret = new Stop(id);
  for (var key in data) {
    if (undefined != data[key]) {
      ret[key] = data[key];
    }
  }
  fn(ret);
};