module.exports = {
  get: createjs.Tween.get,
  Ease: createjs.Ease,
  setFPS: function(FPS) {
    createjs.Ticker.setFPS(FPS);
  }
};
