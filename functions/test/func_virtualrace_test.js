/**
 * Online tests
 */
const { cfg, debug, projroot } = require("./commonTest")

const GS_URL_PREFIX = 'https://storage.googleapis.com/run-pix.appspot.com/'
const { assert } = require('chai')

// const { firebaseConfig } = require('firebase-functions');
const functions = require('firebase-functions');
const { storageBucket } = require('firebase-functions/params');
const test = require('firebase-functions-test')(cfg.firebaseConfig,
    cfg.service_account);
const firestore = require("../firebaseUser")

describe('Virtual Races', function () {
    // this.timeout(10000)
    this.timeout(10000);
    const virtualRaces = require("../virtualRaces")

    it('List races (restart test case)', async () => {
        races= await virtualRaces.readActiveRaces()
        return console.table(races)
    })

    it('Create dynamic race coming Sunday',async ()=>{
        'write date based on date..'
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        debug(await virtualRaces.createLiveRace('pcmcrunners',{
            Name: 'Daily Run',
            Date: tomorrow,
            status: ['live','nolist'],
            Distances: ['10K','5K']
        }))
    })

    it('Map Race',async ()=>{
        'write date based on date..'
        msg={"type":"activity",
                  "athlete":{},
                  "event":{"aspect_type":"create","event_time":1726738572,"object_id":1231233
                  },
                  activity:{
                    fitnessApp:"strava",
                    "id" : 12345678987654321,
                    athlete: {id:14965596, resource_state:1},
                    device_name:"Garmin",
                    name: "test activity",
                    sport_type: 'Run',
                    start_time_local: "2024-09-20T04:59:39Z",
                    start_time: "2024-09-20T04:59:39Z",
                    timezone: "(GMT+05:30) Asia/Kolkata",
                    utc_offset:19800,
                    distance:15300.4,
                    elapsed_time:10986,
                    elev_high:586,
                    elev_low:564.5,
                    trainer: false,
                    
                }};
        debug(await virtualRaces.processActivity(msg))
    })

})