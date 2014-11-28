function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Point.prototype.normalize = function(len) {
  len = len || 1;
  var length = this.length();
  this.x = this.x / length * len;
  this.y = this.y / length * len;
  if (isNaN(this.x)) {
    this.x = 0;
  }
  if (isNaN(this.y)) {
    this.y = 0;
  }
  return this;
};

Point.prototype.offset = function(v) {
  this.x += v.x || 0;
  this.y += v.y || 0;
  return this;
};

Point.prototype.add = Point.prototype.offset;

Point.prototype.distance = function(v) {
  var x = v.x - this.x;
  var y = v.y - this.y;
  return new Point(x,y);
};

Point.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point.prototype.scale = function(scale) {
  this.x *= scale;
  this.y *= scale;
};

Point.prototype.copy = function(v) {
  this.x = v.x;
  this.y = v.y;
};

Point.prototype.near = function(v, threshold) {
  return Math.abs(v.x - this.x) <= threshold && Math.abs(v.y - this.y) <= threshold;
};

Point.prototype.subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

Point.prototype.clone = function() {
  return new Point(this.x, this.y);
};

Point.prototype.truncate = function(n) {
  var directionX = this.x / Math.abs(this.x);
  var directionY = this.y / Math.abs(this.y);
  this.x = Math.min(Math.abs(this.x), n) * directionX;
  this.y = Math.min(Math.abs(this.y), n) * directionY;
};


module.exports = Point;
