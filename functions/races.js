const _ = require("lodash");
const { firestore } = require("./firebaseUser");
const dayjs = require("dayjs");
const admin = require("firebase-admin");
// const admin = require("firebase-admin");
// const { debug } = require("./utils");
const { debug } = require("./utils");
// const admin = require('firebase-admin');
/**
 * Races that are started
 * Not expired
 */

let activeRaces={}

async function readLiveRaces(
    status = ['live'],
    cutoffDays = 6
){

    if (_.keys(activeRaces).length)
        return activeRaces;

    cols = "id Name Location Date status Distances".split(" ");
    const racesData = await firestore.getCol('/races',
        x => _.assign({ id: x.id }, x.data()));
    // debug(_.keys(racesData[0]))
    const cutoffDate = new Date(_.now().valueOf() - cutoffDays * 24 * 3600 * 1000);
    activeRaces = _(racesData)
        .filter(x => _.intersection(x.status, status).length)
        // .tap(x=>debug(,new Date(x.Date)> new Date(_.now()-6*24*3600)))
        .filter(x => new Date(x.Date) > cutoffDate)
        .map(x => _.pick(x, cols))
        .value();
    return activeRaces;
}

async function createRace(id , group,template, data) {
    return await firestore.doc(`/races/${id}`).get().then(async snap=>{
        if (!snap.exists){
            await firestore.doc(`defaults/races/${group}/${template}`).get().then(async raceTemplate=>{

                raceData = _.assign(raceTemplate.data(),data)

                const raceDoc = await firestore.doc(`/races/${id}`).set(raceData);
            
                return raceData;
            })
        } else {
            throw new Error(`Error Race ${id} already exists`)
        }
    })
}

async function createRaceNthSunday(group,template="mychoice",weekNo=-1,DayNo=0) {
    let nThSundayOfMonth = getNthSundayOfMonth(weekNo)
    const id = `${template}${nThSundayOfMonth.format("YYMMM")}`.toLowerCase();
    
    let data = {
        Date : nThSundayOfMonth.format('YYYY-MM-DD'),
        id : id
    }
    const ret = await createRace(id, group,template, data);
    
    return ret;
}


async function createSundayRace(group,template="weekly") {
    comingSunday = dayjs().add(7,'d').startOf('w')
    const id = `${template}-${comingSunday.format("YY-MM-DD")}`.toLowerCase();
    let data = {
        Date : comingSunday.format('YYYY-MM-DD'),
        id : id
    }
    const ret = await createRace(id, group,template, data);
    
    return ret;
}
function getNthSundayOfMonth(n) {
    return n < 0 ?
        dayjs().endOf('month').subtract(dayjs().endOf('month').day() * -7 * (n + 1) + 1, 'd') :
        dayjs().startOf('month').add(-dayjs().startOf('month').day() + n * 7 + 1, 'd');
}

let race_cfg = {};
const getRaceCfg = async (race) => {
  if (race_cfg.hasOwnProperty(race))
    return race_cfg[race];
  admin.firestore().doc(`races/${race}`)
    .onSnapshot(snap => {
      race_cfg[race] = snap.data();
      debug(`load ${race}`, race_cfg[race]);
      return race_cfg[race];
    });
  // function below waits 3 seconds
  return await new Promise(resolve => setTimeout(resolve, 1000))
    .then(() => race_cfg[race]);
};
// exports.getRaceCfg = getRaceCfg;

export {
    readLiveRaces,
    createRaceNthSunday,
    createRace,
    createSundayRace,
    getRaceCfg,
    race_cfg
};
