var assert = require('assert');

let videocr=require('../index.js');

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('videocr', function () {
    before(function () {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = '/i/auth/run-pix-092258e3cb1b.json';
        console.warn(`setting process.env.GOOGLE_APPLICATION_CREDENTIALS = ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`)
    });

    it('basic call',async function (){
        await videocr.detectText()
    })
}   )