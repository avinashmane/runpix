//During the test the env variable is set to test


// let mongoose = require("mongoose");
// let Book = require('../app/models/book');
const {cfg,debug} = require ("./commonTest")
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

// let server = require('../index');


//Our parent block
describe('Check Express functions', function () {
  before(() => { //Before each test we empty the database
    debug(`Using chaiHttp with ${cfg.baseUrl}`)
  });
  this.timeout(50000);
  before(() => { //Before each test we empty the database
    debug(`End ${__filename || ''}`)
  });
  /*
    * Test the /GET route
    */
  describe('express API', function () {

    "mychoice24may,testrun".split(",").forEach(race => {
      it(`it should GET race ${race}`, function (done) {

        chai.request(baseUrl)
          .get(`/race/${race}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            //   debug(race,res.body)
            //   res.body.length.should.not.be.equal(0);
            done();
          });
      });
      it(`HealthCheck`, function (done) {

        chai.request(baseUrl)
          .get(`/healthcheck`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            debug(res.body)
            //   res.body.length.should.not.be.equal(0);
            done();
          });
      });

    });
  });

});


