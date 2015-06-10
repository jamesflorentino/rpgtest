function SpriteComponent(obj) {
  this.object = obj;
}

SpriteComponent.prototype.play = function(state) {
  if (!this.object.gotoAndPlay) { return; }
  if (this._currentState === state) { return; }
  this._currentState = state;
  this.object.gotoAndPlay(state);
};


SpriteComponent.prototype.name = 'sprite';

module.exports = SpriteComponent;
