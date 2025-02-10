// let Book = require('../app/models/book');
const {cfg,debug} = require ("./commonTest")
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
const {Race,firestore} = require("../races");
const { log } = require("../utils");
const { race } = require("async");

describe("Race",function(){
    describe('race:basic operations',function(){
        const raceId= "mychoice25feb"
        it('race:getAttr',function() {
            return new Race(raceId)
                .getAttr()
                .then(console.warn)
        } )
        it('race:getCol readings',async function() {
            return await new Race(raceId)
                // .getCol('readings')
                .getReadings()
                .then(console.table)
        } )
        it('race:list_blob_full storage videos',async function() {
            return await new Race(raceId)
                .getBlobs('uploadvid')
                .then(console.table)
        } )
        it('race:del_blob_file delete videos',async function() {
            const race=new Race(raceId)
            await race._deleteStorageDocument('uploadvid/mychoice25jan/1601-01-01T00:00:00.000Z~END~avinashmane@gmail.com~VID_20250112_073824.mp4')
                .then(console.log).catch(console.error)
            return await race._deleteBlob('uploadvid/mychoice25jan/1601-01-01T00:00:00.000Z~VENUE~avinashmane@gmail.com~VID_20250112_075044.mp4',false)
                .then(console.log).catch(console.error)
        } )
    })

    
    describe('race:batch operations',function(){
        
        const raceId= "mychoice25feb"

        it('race:reprocess_video unprocessed files',async function() {
            const race=new Race(raceId)
            return await race
                .getBlobs('uploadvid')
                .then(async (blobPaths)=>{
                    for(let blobPath of blobPaths)
                        console.log(await race.checkBlob(blobPath))
                })
        } )

        it('race:reprocess_manual entry (from mychoice25jan to mychoice25feb',async function() {
            const race=new Race(raceId)
            const targetRace=new Race('mychoice25feb')
            return await race
                .getReadings()
                .then(async (readings)=>{
                    for(let r of readings)
                        if (r?.id?.includes('2025-02-09')){
                            await targetRace.setSubDoc(`readings/${r.id}`,r)
                            console.log(r)
                        }
                })
        } )

        it('race:check_blob_date blobs->videos->readings',async function() {
            try{
            const race=new Race(raceId)
            await race.getAttr()
            return await race
                .getBlobs('uploadvid')
                .then(async (blobPaths)=>{
                    for(let blobPath of blobPaths){
                        const vidFileName=blobPath.split('/').at(-1)
                        if(vidFileName.includes(race.Date))
                            log(`${race.Date} ${vidFileName}` )
                        else {
                            await race._deleteBlob(blobPath,false)
                                .then(console.log)
                                .catch(console.error)
                // return
                        }
                    }
                })
            } catch (e) {
                console.error(e)
            }
        } )

        it('race:check_readings_date delete readings not matching date',async function() {
            try{
            const race=new Race(raceId)
            const readings=await race.getReadings()

            const readingsToDelete=readings.filter(x=>(x.hasOwnProperty('imagePath')
                                                        && !x.imagePath.includes(race.Date)))

            for (let x of readingsToDelete)
                                    await race._deleteRaceDocument(`readings/${x.id}`)
                                        .then(`deleting readings/${x.id}`)
                                        .catch(console.error)
            
            return readingsToDelete

            } catch (e) {
                console.error(e)
            }
        } )

    })

})