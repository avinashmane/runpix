// let Book = require('../app/models/book');
const {cfg,debug} = require ("./commonTest")
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
const {Race} = require("../races")

describe("Race",function(){
    describe('race:basic operations',function(){
        const raceId= "mychoice25jan"
        it('race:getAttr',function() {
            return new Race(raceId)
                .getAttr()
                .then(console.warn)
        } )
        it('race:getCol readings',async function() {
            return await new Race(raceId)
                .getCol('readings')
                .then(console.table)
        } )
        it('race:list storage videos',async function() {
            return await new Race(raceId)
                .getBlobs('uploadvid')
                .then(console.table)
        } )
    })

    
    describe('race:batch operations',function(){
        
        const raceId= "mychoice25jan"

        it('race:check storage videos',async function() {
            const race=new Race(raceId)
            return await race
                .getBlobs('uploadvid')
                .then(async (blobPaths)=>{
                    for(let blobPath of blobPaths)
                        console.log(await race.checkBlob(blobPath))
                })
        } )
    })

})