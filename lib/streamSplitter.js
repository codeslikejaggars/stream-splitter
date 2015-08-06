'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = streamSplitter;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _through2 = require('through2');

// @TODO control how large fragment can be?
/**
 * Returns a transform stream that splits the readable into
 * chunks ala `String.split()`
 * @param  {String|RegExp} options.separator the separator to use
 * @param  {Boolean} options.skipEmptyChunks whether empty chunks will be ignored (e.g. last lines)
 * @return {TransformStream} a transform stream
 */

var _through22 = _interopRequireDefault(_through2);

function streamSplitter() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$separator = _ref.separator;
  var separator = _ref$separator === undefined ? /\r?\n/ : _ref$separator;
  var _ref$skipEmptyChunks = _ref.skipEmptyChunks;
  var skipEmptyChunks = _ref$skipEmptyChunks === undefined ? true : _ref$skipEmptyChunks;

  function maybePush(stream, chunk) {
    if (chunk || !skipEmptyChunks) {
      stream.push(chunk);
    }
  }

  var fragment = '';
  return _through22['default'].obj(function (chunk, encoding, done) {
    var _this = this;

    // @FIXME what if the chunk isn't a string?

    // to handle separator substrings at chunk boundaries
    // prepend the fragment to the chunk and split the result
    var split = (fragment + chunk).split(separator);
    var head = split.shift();

    if (split.length) {
      fragment = split.pop() || '';
      [head].concat(_toConsumableArray(split)).forEach(function (each) {
        return maybePush(_this, each);
      });
    } else {
      fragment += head;
    }

    return done();
  },
  // flush
  function (done) {
    maybePush(this, fragment);
    done();
  });
}

module.exports = exports['default'];

