/**
 * Online tests
 */


const {cfg,debug} = require ("./commonTest")
const config={
    projectId:`${cfg.projectId}`,
    storageBucket: `${cfg.projectId}.appspot.com`,
    databaseURL: `https://${cfg.projectId}.firebaseio.com`,
  }
// const GS_URL_PREFIX='https://storage.googleapis.com/run-pix.appspot.com/'
const {assert, expect} = require('chai')

const admin = require('firebase-admin');
const test = require('firebase-functions-test')(config,
    cfg.service_account);
const dayjs = require('dayjs')
const _ = require("lodash")
const firebaseUser = require('../firebaseUser');
const { finalize_results } = require('../raceTiming.js');
const { Alert } = require('selenium-webdriver');
let fn
const doc=(path)=>admin.firestore().doc(path)
const get=(path,callback)=>doc(path).get().then(x=>callback(x.data())) 
const getCol=(path,callback)=>admin.firestore().collection(path).get()
                        .then(snap=>{
                            let arr=[]
                            snap.forEach(doc=>arr.push(callback(doc)))
                            return arr;
                        })

// Mock functions config values
// test.mockConfig(config);//{ stripe: { key: '23wr42ewr34' }}
// const key = functions.config().stripe.key;
// process.env.FIREBASE_CONFIG=config.storageBucket
// after firebase-functions-test has been initialized


function openURI (URI) {
  var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
  // require('child_process').exec(start + ' ' + URI);
}                                  

now=()=>new Date().toISOString()
// const {parseObjName}= require('../utils.js')
describe('Test of database changes/functions', function(){

    before(function(){
        fn = require('../index.js')
    })

    after(function(){
        // debug('done')
        admin.app().delete() 
        test.cleanup()
    })

    xdescribe ('Test database changes /races/videos -trigger update readings', function (){
        let data
        const params= {
            raceId: 'testrun',
            videoPath: '2024-05-08T06:10:08.601Z~VENUE~avinashmane$gmail.com~vid_0.webm'
        }
        const path=`/races/${params.raceId}/videos/${params.videoPath}`

        before(async function (){
            data = await get(path,x=> x)
        })

        it('timingUpdate - update - video', function(){
            // Make snapshot for state of database beforehand
            const beforeSnap = test.firestore.makeDocumentSnapshot(data, path);
            // Make snapshot for state of database after the change
            const afterSnap = test.firestore.makeDocumentSnapshot(
                Object.assign({waypoint: '10K'},data), 
                path);
            const change = test.makeChange(beforeSnap, afterSnap);
            // Call wrapped function with the Change object
            const wrapped = test.wrap(fn.timingUpdate);
            return wrapped(change, {params:params});

        })

        it('timingUpdate - delete reading - video', function(){
            // Make snapshot for state of database beforehand
            const beforeSnap = test.firestore.makeDocumentSnapshot(data, path);
            // Make snapshot for state of database after the change
            const afterSnap = test.firestore.makeDocumentSnapshot({}, path)
            const change = test.makeChange(beforeSnap, afterSnap);
            // Call wrapped function with the Change object
            const wrapped = test.wrap(fn.timingUpdate);
            return wrapped(change, {params:params});

        })

    })

    describe ('finalize results - readings', function (){
        let dataReadings,bibs,raceTiming,race
        raceTiming = require('../raceTiming.js')
        const params= {
            raceId: 'testrun',
        }
    
        function rerankResults(raceId){

        }
        before(async function (){
            this.timeout(50000)
            race  = await get(`/races/${params.raceId}`,x=>x)
            bibs = await getCol(`/races/${params.raceId}/bibs`,
                doc=>(Object.assign({id:doc.id},doc.data())) )
            dataReadings = await getCol(`/races/${params.raceId}/readings`,
                doc=>raceTiming.mapReading(doc,bibs))
        })


        it('finalize result readings ', function(){
            // debug(data)
            const allEntries = raceTiming.addStatusFields(dataReadings,
                                                race?.timestamp?.start)
            expect(allEntries.length).to.be.greaterThan(10)
            const ret = finalize_results(allEntries,race)


            // Save all entries
            ret.docs.forEach((category) => {
                debug(`saving ${category.entries.length} entries for ${category.cat}`);
                category.entries.forEach((x) => {
                    try {
                        // debug(`${x.Rank} ${x.Name} ${x['Race Time']}`)
                        doc(`races/${params.raceId}/result/${x.Bib}`)
                            .set( x)
                            
                            .then(debug)
                    } catch (e) {
                        console.error("error saving", e);
                    }
                });
            });


             doc( `races/${params.raceId}`).update({
                 "timestamp.result": new Date().toISOString(),
             });

        })

        it('finalize result readings Save', async function(){
            // debug(data)
            const ret = await fn.save_result(params.raceId,)
            debug(ret)
        })

        
    })

    describe ('virtual finalize results - activities ', function (){
        let dataReadings,bibs,raceTiming,race
        const params= {
            raceId: 'weekly-24-09-29',//'pcmcrunners2024-09-24',
            key:'something,'
        }
        let data
        const path=`/races/${params.raceId}/activities/${params.key}`


    
        before(async function (){
            this.timeout(50000)
            race  = await get(`/races/${params.raceId}`,x=>x)
            raceTiming = require('../raceTiming.js')
            bibs = await getCol(`/races/${params.raceId}/bibs`,
                doc=>(Object.assign({id:doc.id},doc.data())) )
            dataReadings = await getCol(`/races/${params.raceId}/activities`,
                doc=>raceTiming.mapActivityToResult(doc,bibs))
        })


        it('virtual finalize result readings ', function(){
            
            allEntries=dataReadings
            // Deduplication
            allEntries=raceTiming.checkRuleSplitDups(allEntries)
            // Registration name Rule
            if (race.registrationRequired){
                "filter and map name from bibs"
            } else{
                allEntries=allEntries.map(x=>_.extend(x,{
                    Name : `Strava ${x.athlete}`
                }))
            }
            // allEntries = raceTiming.addStatusFields(dataReadings,
            //                                     race?.timestamp?.start)
            expect(allEntries.length).to.be.greaterThan(10)
            const ret = finalize_results(allEntries,race)


            // Save all entries
            ret.docs.forEach((category) => {
                debug(`saving ${category.entries.length} entries for ${category.cat}`);
                category.entries.forEach((x) => {
                    try {
                        // debug(`${x.Rank} ${x.Name} ${x['Race Time']}`)
                        doc(`races/${params.raceId}/result/${x.Bib}`)
                            .set( x)
                            .then(debug(`saved ${x.bib}`))
                        
                    } catch (e) {
                        console.error("error saving", e);
                    }
                });
            });


             doc( `races/${params.raceId}`).update({
                 "timestamp.result": new Date().toISOString(),
             });

        })

        it('virtual finalize result firetore change event', async function(){
            // Make snapshot for state of database beforehand
            const beforeSnap = test.firestore.makeDocumentSnapshot(data, path);
            // Make snapshot for state of database after the change
            const afterSnap = test.firestore.makeDocumentSnapshot({}, path)
            const change = test.makeChange(beforeSnap, afterSnap);
            // Call wrapped function with the Change object
            const wrapped = test.wrap(fn.activitiesToResult);
            return wrapped(change, {params:params});

        })        
    })

})