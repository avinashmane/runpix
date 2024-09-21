/**
 * Virtual races
 */
const {firestore} = require("./firebaseUser")
const _ = require ("lodash");
const debug = require("debug")('TEST')

let activeRaces={}
/**
 * 
 * @param {*} msg 
 * 
 * check the race is matched among , date, activity type, distance (future GPS)
 * 
 */
async function processFitnessActivity(msg){

    await readActiveRaces()
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
        const eligibleDistances=_(distances).filter(x=> x<=act.distance).orderBy().value()
        
        if(eligibleDistances.length){
            const distance=eligibleDistances.pop()
            const distName= race.Distances[distances.indexOf(distance)] || 'xK'
            
            
            await saveRaceActivity(distName, distance, act, race, msg.event);
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

async function saveRaceActivity(distName,distance, act, race, event) {
    const selectedActivityFields=['sport_type','start_date_local','start_latlng','device_name']
    const athleteId=act.athlete.id 
    const elapsed=getEffectiveTime(distance,act);
    
    debug(`act ${act.id} distance ${distance}/${act.distance} mins ${(elapsed/60).toFixed(2)} min `)
    
    key = `${athleteId}_${distName}_${act.id}`;
    await firestore.doc(`/races/${race.id}/activities/${key}`).set(_.assign({
        athlete: athleteId,
        distance: distance,
        elapsed: elapsed,
        event: event.aspect_type
    },_.pick(act,selectedActivityFields)
    ));
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


/**
 * Races that are started
 * Not expired 
 */
async function readActiveRaces (
                status=['live'],
                cutoffDays=6) {
    
                    if (_.keys(activeRaces).length) 
        return activeRaces                    

    cols="id Name Location Date status Distances".split(" ")
    const racesData= await firestore.getCol('/races',
        x=> _.assign({id:x.id},x.data()))
        // debug(_.keys(racesData[0]))
    const cutoffDate=new Date(_.now().valueOf()-cutoffDays*24*3600*1000)
    activeRaces = _(racesData)
        .filter(x=>_.intersection(x.status,status).length)
        // .tap(x=>debug(,new Date(x.Date)> new Date(_.now()-6*24*3600)))
        .filter(x=>new Date(x.Date)> cutoffDate)
        .map(x=>_.pick(x,cols))
        .value()
    return activeRaces
}

async function createLiveRace (prefix,data){
    data.Date = data.Date || getUpcomingSunday(new Date())  // default to coming Sunday
    data.Date = _.isDate(data.Date) ? data.Date?.toISOString() : data.Date
    data.Date = data.Date?.substring(0,10)
    id = `${prefix}${data.Date}`
    data.Location  = data.Location || 'Virtual'

    const raceDoc= firestore.doc(`/races/${id}`)
    await raceDoc.set(data)

    return data
}

function getUpcomingSunday(date) {
    date = date || new Date();
    const daysUntilSunday = 7 - date.getDay(); // Calculate the number of days until the next Sunday
  
    // If today is Sunday, add 7 days to get the next Sunday
    if (date.getDay() === 0) {
      daysUntilSunday += 7;
    }
  
    const upcomingSunday = new Date(date.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
    return upcomingSunday;
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
readActiveRaces()

module.exports = {
    readActiveRaces,
    createLiveRace,
    processFitnessActivity,
    activeRaces
}