function Input() {
  this.keyboard = {};
  for(var keyCode in Input.KeyCodes) {
    if (Input.KeyCodes.hasOwnProperty(keyCode)) {
      this.keyboard[Input.KeyCodes[keyCode]] = {};
    }
  }
}

Input.prototype.enable = function() {
  var input = this;
  window.addEventListener('keydown', function(e) {
    var keyObject = input.get(e.keyCode);
    if (!keyObject) { return; }
    keyObject.isDown = true;
  });
  window.addEventListener('keyup', function(e) {
    var keyObject = input.get(e.keyCode);
    if (!keyObject) { return; }
    keyObject.isDown = false;
  });
  window.addEventListener('blur', function() {
    for(var key in input.keyboard) {
      if (input.keyboard.hasOwnProperty(key)) {
        input.keyboard[key].isDown = false;
      }
    }
  });
};

Input.prototype.get = function(keyCode) {
  console.log(keyCode);
  var key = Input.KeyCodes[keyCode];
  if (!key) { return; }
  var keyObject = this.keyboard[key];
  return keyObject;
};

Input.KeyCodes = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  16: 'shift',
  17: 'shift',
  65: 'A',
  87: 'W',
  83: 'S',
  68: 'D'
};


module.exports = Input;
