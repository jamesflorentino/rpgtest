var express = require('express');
var router = express.Router();

var browserify = require('browserify');

router.get('/', function(req, res) {
  var b = browserify();
  b.add('./src');
  b.bundle(function(err, buff) {
    try {
      res.set('Content-Type', 'application/javascript');
      res.write(buff);
    } catch(error) {
      console.error('err', error);
    }
    res.end();
  });
});

module.exports = router;
