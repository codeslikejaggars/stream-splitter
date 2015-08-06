import {expect} from 'chai';
import path from 'path';
import fs from 'fs';
import streamify from 'stream-array';
import streamSplitter from '../streamSplitter';

var presidentsPath = path.join(__dirname, 'fixtures/presidents.txt');
// sampling of presidents
const presidents = {
  1 : 'George Washington',
  9 : 'William H. Harrison',
  44: 'Barack Hussein Obama'
};

function presidentialStream() {
  return fs.createReadStream(presidentsPath, {
    encoding: 'utf8'
  });
}

describe('streamSplitter()', () => {

  it('splits a read stream into distinct lines by default', done => {
    let i = 0;
    presidentialStream().pipe(streamSplitter())
    .on('data', line => {
      let expected = presidents[++i];
      if(expected) {
        expect(line).to.equal(expected);
      }
    })
    .on('finish', () => {
      expect(i).to.equal(44);
      done();
    });
  });


  it('handles separators divided over multiple chunks', done => {
    const separator = 'XXX';

    let result = '';
    streamify(['aX', 'XXbXXX', 'cXX', 'XdXXXe'])
      .pipe(streamSplitter({ separator }))
      .on('data', chunk => {
        // console.log(chunk);
        result += chunk;
      })
      .on('finish', () => {
        expect(result).to.equal('abcde');
        done();
      });
  });


  it('works with string separators', done => {
    const separator = 'X';
    const input = 'abc';

    let result = ''
    streamify([input.split('').join(separator)])
      .pipe(streamSplitter({ separator }))
      .on('data', chunk => {
        result += chunk;
      })
      .on('finish', () => {
        expect(result).to.equal(input);
        done();
      });
  });


  it('works with regexp separators', done => {
    const separator = 'X';
    const input = 'abc';

    let result = ''
    streamify([input.split('').join(separator)])
      .pipe(streamSplitter({ separator : new RegExp(separator) }))
      .on('data', chunk => {
        result += chunk;
      })
      .on('finish', () => {
        expect(result).to.equal(input);
        done();
      });
  });


  it('ignores empty chunks by default', done => {
    const separator = ',';

    let count = 0;
    streamify(['1,2,3,4,']).pipe(streamSplitter({ separator }))
      .on('data', chunk => {
        count++;
      })
      .on('finish', () => {
        expect(count).to.equal(4);
        done();
      });
  });


  it('doesnt ignore empty chunks when configured', done => {
    const separator = ',';

    let count = 0;
    streamify(['1,2,3,4,']).pipe(streamSplitter({ separator, skipEmptyChunks : false }))
      .on('data', chunk => {
        count++;
      })
      .on('finish', () => {
        expect(count).to.equal(5);
        done();
      });
  });
});


