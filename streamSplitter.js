import through from 'through2';

// @TODO control how large fragment can be?
/**
 * Returns a transform stream that splits the readable into
 * chunks ala `String.split()`
 * @param  {String|RegExp} options.separator the separator to use
 * @param  {Boolean} options.skipEmptyChunks whether empty chunks will be ignored (e.g. last lines)
 * @return {TransformStream} a transform stream
 */
export default function streamSplitter({separator = /\r?\n/, skipEmptyChunks = true} = {}) {
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
