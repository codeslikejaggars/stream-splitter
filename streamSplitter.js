import through from 'through2';

// @TODO control how large fragment can be?
/**
 * Returns a transform stream that splits the readable into
 * chunks ala `String.split()`
 * @param  {String|RegExp} separator the separator to use
 * @param  {Boolean} options.skipEmptyChunks whether empty chunks will be ignored (e.g. last lines)
 * @param  {'head' or 'tail' or falsy} options.retainSeparator if specified, where separator will be retained
 * @return {TransformStream} a transform stream
 */
export default function streamSplitter(separator = /\r?\n/, {
  skipEmptyChunks = true, retainSeparator = false} = {}) {
  // @TODO validate arguments
  // @TODO implement separator retention
  // @FIXME handle calling split() with regexp containing groups
  // /Problem \d+/
  function maybePush(stream, chunk) {
    if(chunk || !skipEmptyChunks) {
      stream.push(chunk);
    }
  }

  let fragment = '';
  return through.obj(
    function(chunk, encoding, done) {
      // @FIXME what if the chunk isn't a string?

      // to handle separator substrings at chunk boundaries
      // prepend the fragment to the chunk and split the result
      let split = (fragment + chunk).split(separator);
      let head = split.shift();

      if(split.length) {
        fragment = split.pop() || '';
        [head, ...split].forEach(each => maybePush(this, each))
      } else {
        fragment += head;
      }

      return done();
    },
    // flush
    function(done) {
      maybePush(this, fragment);
      done();
    }
  );
}
