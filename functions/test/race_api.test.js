//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// let mongoose = require("mongoose");
// let Book = require('../app/models/book');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();


chai.use(chaiHttp);

// let server = require('../index');
const baseUrl = 'http://localhost:5000/run-pix/us-central1/api'; // Replace with 

//Our parent block
describe('race_api', function ()  {
    // beforeEach(() => { //Before each test we empty the database
  
    // });
    this.timeout(50000); 

/*
  * Test the /GET route
  */
  describe('/GET race', function ()  {
    
    "mychoice24may,testrun".split(",").forEach(race => {
      it(`it should GET race ${race}`, function (done) {
        
        chai.request(baseUrl)
            .get(`/race/${race}`)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                //   console.log(race,res.body)
                //   res.body.length.should.not.be.eql(0);
              done();
            });
      });      
    });
  });

});


