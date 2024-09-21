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
const _ = require("lodash")

describe('Virtual Races', function () {
    // this.timeout(10000)
    this.timeout(10000);
    const virtualRaces = require("../virtualRaces")
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    it('List races (restart test case)', async () => {
        races= await virtualRaces.readActiveRaces()
        return console.table(races)
    })

    it('Create dynamic race coming Sunday',async ()=>{
        'write date based on date..'

        debug(await virtualRaces.createLiveRace('pcmcrunners',{
            Name: 'Daily Run',
            Date: tomorrow,
            status: ['live','nolist'],
            Distances: ['10K','5K']
        }))
    })

    it('Map Race',async ()=>{
        'write date based on date..'
        newDate=tomorrow.toISOString().slice(0,10)
        replace_dates = (x,newDate) => _.mapValues(x,(o,k)=> k.includes('start_date')? o.replace(/^.{10}/g,newDate): o)
        msg={"type":"activity",
                  "athlete":{},
                  "event":{"aspect_type":"create","event_time":1726738572,"object_id":1231233
                  },
                  activity:replace_dates(activity_dat1,newDate)};
        debug(await virtualRaces.processFitnessActivity(msg))
    })

})

const activity_dat1={
    "achievement_count": 1,
    "athlete": {
      "id": 10934375,
      "resource_state": 1
    },
    "athlete_count": 2,
    "average_cadence": 79.4,
    "average_speed": 2.411,
    "calories": 1798.3,
    "comment_count": 0,
    "commute": false,
    "device_name": "Strava Android App",
    "display_hide_heartrate_option": false,
    "distance": 19925,
    "elapsed_time": 11388,
    "elev_high": 595.8,
    "elev_low": 555,
    "embed_token": "a30f2a9a9da5ec28fd752b4b4441f1adbb2de513",
    "end_latlng": [
      18.541568694636226,
      73.82931766100228
    ],
    "external_id": "5044ddea-d86e-4b67-985e-6d1561bcfc92-activity.fit",
    "fitnessApp": "strava",
    "flagged": false,
    "from_accepted_tag": false,
    "gear": {
      "converted_distance": 20590.8,
      "distance": 20590832,
      "id": "g1638426",
      "name": "Nike Free 5.0",
      "nickname": "",
      "primary": false,
      "resource_state": 2,
      "retired": false
    },
    "gear_id": "g1638426",
    "has_heartrate": false,
    "has_kudoed": false,
    "heartrate_opt_out": false,
    "hide_from_home": false,
    "id": 12404778961,
    "kudos_count": 0,
    "location_country": "India",
    "manual": false,
    "max_speed": 6.012,
    "moving_time": 8265,
    "name": "Morning Run",
    "photo_count": 0,
    "photos": {
      "count": 0
    },
    "pr_count": 1,
    "prefer_perceived_exertion": false,
    "private": false,
    "resource_state": 3,
    "splits_metric": [
      {
        "average_grade_adjusted_speed": 2.3,
        "average_speed": 2.29,
        "distance": 1004.8,
        "elapsed_time": 438,
        "elevation_difference": -2.6,
        "moving_time": 438,
        "pace_zone": 1,
        "split": 1
      },
      {
        "average_grade_adjusted_speed": 2.18,
        "average_speed": 2.17,
        "distance": 996.1,
        "elapsed_time": 458,
        "elevation_difference": -0.8,
        "moving_time": 458,
        "pace_zone": 1,
        "split": 2
      },
      {
        "average_grade_adjusted_speed": 2.47,
        "average_speed": 2.4,
        "distance": 1000.8,
        "elapsed_time": 417,
        "elevation_difference": 10.7,
        "moving_time": 417,
        "pace_zone": 1,
        "split": 3
      },
      {
        "average_grade_adjusted_speed": 2.11,
        "average_speed": 2.08,
        "distance": 999.6,
        "elapsed_time": 481,
        "elevation_difference": 3.9,
        "moving_time": 481,
        "pace_zone": 1,
        "split": 4
      },
      {
        "average_grade_adjusted_speed": 2.6,
        "average_speed": 2.63,
        "distance": 1003,
        "elapsed_time": 381,
        "elevation_difference": -7.1,
        "moving_time": 381,
        "pace_zone": 1,
        "split": 5
      },
      {
        "average_grade_adjusted_speed": 2.67,
        "average_speed": 2.67,
        "distance": 999.8,
        "elapsed_time": 375,
        "elevation_difference": 0.6,
        "moving_time": 375,
        "pace_zone": 1,
        "split": 6
      },
      {
        "average_grade_adjusted_speed": 2.74,
        "average_speed": 2.75,
        "distance": 996.5,
        "elapsed_time": 363,
        "elevation_difference": -1.7,
        "moving_time": 363,
        "pace_zone": 1,
        "split": 7
      },
      {
        "average_grade_adjusted_speed": 2.62,
        "average_speed": 2.65,
        "distance": 1001.7,
        "elapsed_time": 378,
        "elevation_difference": -6.1,
        "moving_time": 378,
        "pace_zone": 1,
        "split": 8
      },
      {
        "average_grade_adjusted_speed": 2.54,
        "average_speed": 2.57,
        "distance": 1001.3,
        "elapsed_time": 390,
        "elevation_difference": -6.7,
        "moving_time": 390,
        "pace_zone": 1,
        "split": 9
      },
      {
        "average_grade_adjusted_speed": 2.66,
        "average_speed": 2.62,
        "distance": 996.6,
        "elapsed_time": 380,
        "elevation_difference": 5,
        "moving_time": 380,
        "pace_zone": 1,
        "split": 10
      },
      {
        "average_grade_adjusted_speed": 2.6,
        "average_speed": 2.54,
        "distance": 1001.8,
        "elapsed_time": 394,
        "elevation_difference": 9.8,
        "moving_time": 394,
        "pace_zone": 1,
        "split": 11
      },
      {
        "average_grade_adjusted_speed": 2.7,
        "average_speed": 2.61,
        "distance": 999.9,
        "elapsed_time": 383,
        "elevation_difference": 13.9,
        "moving_time": 383,
        "pace_zone": 1,
        "split": 12
      },
      {
        "average_grade_adjusted_speed": 2.56,
        "average_speed": 2.55,
        "distance": 998.1,
        "elapsed_time": 391,
        "elevation_difference": -0.1,
        "moving_time": 391,
        "pace_zone": 1,
        "split": 13
      },
      {
        "average_grade_adjusted_speed": 2.78,
        "average_speed": 2.8,
        "distance": 1000.8,
        "elapsed_time": 358,
        "elevation_difference": -6.5,
        "moving_time": 358,
        "pace_zone": 2,
        "split": 14
      },
      {
        "average_grade_adjusted_speed": 2.86,
        "average_speed": 2.72,
        "distance": 1001.3,
        "elapsed_time": 368,
        "elevation_difference": 15.7,
        "moving_time": 368,
        "pace_zone": 2,
        "split": 15
      },
      {
        "average_grade_adjusted_speed": 2.82,
        "average_speed": 2.96,
        "distance": 1002.1,
        "elapsed_time": 339,
        "elevation_difference": -24.7,
        "moving_time": 339,
        "pace_zone": 2,
        "split": 16
      },
      {
        "average_grade_adjusted_speed": 2.41,
        "average_speed": 2.47,
        "distance": 998.5,
        "elapsed_time": 3528,
        "elevation_difference": -2.7,
        "moving_time": 405,
        "pace_zone": 1,
        "split": 17
      },
      {
        "average_grade_adjusted_speed": 1.38,
        "average_speed": 1.39,
        "distance": 998.8,
        "elapsed_time": 718,
        "elevation_difference": -6.1,
        "moving_time": 718,
        "pace_zone": 1,
        "split": 18
      },
      {
        "average_grade_adjusted_speed": 2.4,
        "average_speed": 2.33,
        "distance": 1001.5,
        "elapsed_time": 429,
        "elevation_difference": 12.5,
        "moving_time": 429,
        "pace_zone": 1,
        "split": 19
      },
      {
        "average_grade_adjusted_speed": 2.29,
        "average_speed": 2.2,
        "distance": 922,
        "elapsed_time": 420,
        "elevation_difference": 15.6,
        "moving_time": 420,
        "pace_zone": 1,
        "split": 20
      }
    ],
    "sport_type": "Run",
    "start_date": "2024-09-14T00:55:40Z",
    "start_date_local": "2024-09-14T06:25:40Z",
    "start_latlng": [
      18.629549089819193,
      73.7863642629236
    ],
    "timezone": "(GMT+05:30) Asia/Kolkata",
    "total_elevation_gain": 132.7,
    "total_photo_count": 0,
    "trainer": false,
    "type": "Run",
    "upload_id": 13225564499,
    "upload_id_str": "13225564499",
    "utc_offset": 19800,
    "visibility": "everyone",
    "workout_type": 0
  }