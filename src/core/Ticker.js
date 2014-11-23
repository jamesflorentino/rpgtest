function Ticker(FPS) {
  this.FPS = 1000/FPS;
}

Ticker.prototype.start = function() {
  this._interval = setInterval(this.onTick.bind(this), this.FPS);
};

Ticker.prototype.stop = function() {
  clearInterval(this._interval);
};

Ticker.prototype.onTick = function() {
};




module.exports = Ticker;
