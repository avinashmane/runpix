/**
 * Online tests
 */

const projectId='run-pix'
const config={
    projectId:`${projectId}`,
    storageBucket: `${projectId}.appspot.com`,
    databaseURL: `https://${projectId}.firebaseio.com`,
  }

const GS_URL_PREFIX='https://storage.googleapis.com/run-pix.appspot.com/'
const {assert, expect} = require('chai')

const { firebaseConfig } = require('firebase-functions');
const functions = require('firebase-functions');
const { storageBucket } = require('firebase-functions/params');
const test = require('firebase-functions-test')(config,
    'c:/i/auth/run-pix-092258e3cb1b.json');

const firebaseUser = require('../firebaseUser');
const { finalize_results } = require('../raceTiming.js');
const { Alert } = require('selenium-webdriver');
let fn
const doc=(path)=>fn.admin.firestore().doc(path)
const get=(path,callback)=>doc(path).get().then(x=>callback(x.data())) 
const getCol=(path,callback)=>fn.admin.firestore().collection(path).get()
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
        // console.log('done')
        fn.admin.app().delete() 
        test.cleanup()
    })

    xdescribe ('Test database changes trigger - readings', function (){
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
        let data,bibs,raceTiming,race
        const params= {
            raceId: 'testrun',
        }
    
        before(async function (){
            this.timeout(50000)
            race  = await get(`/races/${params.raceId}`,x=>x)
            raceTiming = require('../raceTiming.js')
            bibs = await getCol(`/races/${params.raceId}/bibs`,
                doc=>(Object.assign({id:doc.id},doc.data())) )
            data = await getCol(`/races/${params.raceId}/readings`,
                doc=>raceTiming.mapReading(doc,bibs))
        })


        it('finalize result ', function(){
            // console.log(data)
            const allEntries = raceTiming.addStatusFields(data,
                                                race?.timestamp?.start)
            expect(allEntries.length).to.be.greaterThan(10)
            const ret = finalize_results(allEntries,race)


            // Save all entries
            ret.docs.forEach((category) => {
                console.log(`saving ${category.entries.length} entries for ${category.cat}`);
                category.entries.forEach((x) => {
                    try {
                        // console.log(`${x.Rank} ${x.Name} ${x['Race Time']}`)
                        doc(`races/${params.raceId}/result/${x.Bib}`)
                            .set( x)
                            .then(console.log)
                        
                    } catch (e) {
                        console.error("error saving", e);
                    }
                });
            });


             doc( `races/${params.raceId}`).update({
                 "timestamp.result": new Date().toISOString(),
             });

        })

        
    })
})