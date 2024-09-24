/**
 * Virtual races
 */
const { readLiveRaces } = require("./races");
const {firestore} = require("./firebaseUser")
const _ = require ("lodash");
const debug = require("debug")('TEST')

/**
 * 
 * @param {*} msg 
 * 
 * check the race is matched among , date, activity type, distance (future GPS)
 * 
 */
async function processFitnessActivity(msg){

    let activeRaces =  await readLiveRaces()
    const act = mapActivity(msg)
    let stat={status:null}
    // matchedRaces=activeRaces.map(x=>x.Date==act.Date)
    matchedRaces=activeRaces.filter(x=>x.Date==act.Date)
    
    
    for(const race of matchedRaces){
        // match activity/devices etc.
        if(!race.Distances) {
            debug(`distances not defined ${race.id}` )
            continue
        }
        const distances = race.Distances.map(convertDistance)
        //  only one distance per race
        const eligibleDistances=_(distances)
            .filter(x=> x<=act.distance).orderBy().value()
        
        if(eligibleDistances.length){
            const distance=eligibleDistances.pop()
            const distName= race.Distances[distances.indexOf(distance)] || 'xK'
            
            await saveRaceActivity(distName, distance, act, race, msg.event,msg.athlete);
        } else {
            debug (`No eligible distance : ${act.distance} `,race.Distances)
        }
    } // else
    if (!matchedRaces.length) {
        // const races = matchedRaces(msg)
        debug('no race matched matched')
    }

    return matchedRaces
}

async function saveRaceActivity(distName,distance, act, race, event, athlete) {
    const selectedActivityFields=['sport_type','start_date_local','start_latlng','device_name']
    const athleteId=act.athlete.id 
    const elapsed=getEffectiveTime(distance,act);
    
    debug(`act ${act.id} distance ${distance}/${act.distance} mins ${(elapsed/60).toFixed(2)} min `)
    
    key = `${athleteId}_${distName}_${act.id}`;
    await firestore.doc(`/races/${race.id}/activities/${key}`).set(_.assign({
        athlete: athleteId,
        distance: distance,
        elapsed: elapsed,
        event: event.aspect_type /** check if change has distance or timing changing*/
        },
        _.pick( act, selectedActivityFields),
        _.pick( athlete, ['email','name','gender','image']))
    );
}

function getEffectiveTime(distance, act) {
    try {
        splits_metric = act.splits_metric
        nSplit = Math.ceil(distance / 1000)
        sum_ = (arr, kpi = 'elapsed_time') => arr.reduce((a, x) => a + (x[kpi] || 0), 0)
        getTimes = (splits_metric, n) => Array.from({ length: splits_metric.length - n }, (_, i) => sum_(splits_metric.slice(i, i + n)));
        times = getTimes(splits_metric, nSplit)
        lowestTimeIndex = times.indexOf(_.min(times))
        getSplitPace = (x) => x.elapsed_time / x.distance
        startPace = getSplitPace(splits_metric[lowestTimeIndex])
        endPace = getSplitPace(splits_metric[lowestTimeIndex + nSplit - 1])
        actualDistance = sum_(splits_metric.slice(lowestTimeIndex, lowestTimeIndex + nSplit), "distance")
        actualElapsed = sum_(splits_metric.slice(lowestTimeIndex, lowestTimeIndex + nSplit), "elapsed_time")
        if (actualDistance - distance > 0) {
            // take the slower split i.e high pace sec/m 
            return Math.round(actualElapsed -
                (actualDistance - distance) * Math.max(startPace, endPace))
        } else {
            // take the faster split i.e low pace sec/m
            return Math.round(actualElapsed +
                (actualDistance - distance) * Math.min(startPace, endPace))

        }
    }
    catch (e) {
        return Math.round(act.elapsed_time / act.distance * distance);
    }
}

/**
 * Check vality for races:  get race id
 * @param {*} msg 
 */
function mapActivity(msg){
    const act=msg.activity
    act.Date=act.start_date_local?.substring(0,10)
    return act

}


  function convertDistance(dist){
    if (typeof dist === "string") 
        if ("Kk".includes(dist.slice(-1)))
            return Number(dist.slice(0,-1))*1000
        else
            return Number(dist)*1000
    else
        return dist
  }

module.exports = {
    
    processFitnessActivity,
    
}