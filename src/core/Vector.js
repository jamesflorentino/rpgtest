var Vector = {
  proximity: function(start, end, threshold) {
    return Math.abs(end - start) < threshold;
  },

  truncate: function(start, max) {
    var direction = start > 0 ? 1 : -1;
    return Math.min(Math.abs(start), max) * direction;
  },

  normalize: function(end, start) {
    var direction = end > start ? 1 : -1;
    return Math.abs(end - start) * direction;
  }
};

module.exports = Vector;
