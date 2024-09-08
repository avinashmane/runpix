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
async function processActivity(msg){
    await readActiveRaces()
    const act = mapActivity(msg)
    let stat={status:null}
    // matchedRaces=activeRaces.map(x=>x.Date==act.Date)
    matchedRaces=activeRaces.filter(x=>x.Date==act.Date)
    
    matchedRaces.forEach(race=>{
        // match activity/devices etc.
        
        const distances = race.Distances.map(convertDistance)
        //  only one distance per race
        eligibleDistances=_(distances).filter(x=> x<=act.distance).orderBy().value()
        if(eligibleDistances.length){
            const distance=eligibleDistances.pop()
            const elapsed=getEffectiveTime(distance,act);
            debug(`act ${act.id} distance ${distance}/${act.distance} mins ${(elapsed/60).toFixed(2)} min `)
        } else {
            debug (`No eligible distance : ${act.distance} `,race.Distances)
        }
    }) // else
    if (!matchedRaces.length) {
        // const races = matchedRaces(msg)
        debug('no race matched matched')
    }
    return matchedRaces
}

function getEffectiveTime(distance,act) {
    return act.elapsed_time / act.distance * distance;
}

/**
 * Check vality for races:  get race id
 * @param {*} msg 
 */
function mapActivity(msg){
    const act=msg.activity
    act.Date=act.start_time_local?.substring(0,10)
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
    processActivity,
    readActiveRaces,
    createLiveRace,
    processActivity,
    activeRaces
}