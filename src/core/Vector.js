function Vector(x,y,z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

Vector.prototype.length = function() {
  return Math.sqrt(this.dot());
};

Vector.prototype.dot = function() {
  return this.x * this.x + this.y * this.y;
};

