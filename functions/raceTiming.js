const NOMATCH = "N/A";
const config={}
config.raceMgt = {};
config.raceMgt.ingoredBibStatuses=[null,'','From sheet','From sheet'] 
const {
    chain,
    cloneDeep,
    map,
    each,
    take,
    keys,
    groupBy,
    orderBy ,
    sumBy,
    pick,
    uniqBy,
    split,
    sortBy,
    tap,
    extend,
    padStart
  } = require("lodash");
const _ = require("lodash");
const dayjs = require('dayjs')
const ts_fmt="dddd DD-MMM-YYYY hh:mm:ssa"
const suffixK=(x)=>typeof x === "string" ? x.replace(/([\d\.]+)(k?)/i,"$1K") : x  
const debug = require("debug")("RUNPIX:TIMING")
/**
  * Bib	25

Bib "1"
Category "Male - 10 - 14 years"
Finish Time "7:17:32"
Gender "Male"
Name "KRITARTH AMIT MAHAJAN "
Race "400m"
Race Time "0:07:32"
Rank "1"
Start Time "7:10:00" 
  */
function finalize_results(allEntries,race) {
    
    debug(`finalizing results: ${allEntries.length}`);
    const keys_ = split("bib name timestamp status waypoint gender imagePath", " ");
    
    // map data
    let results = allEntries
        .filter((x) => x.waypoint != "VENUE")
        .filter((x) => "valid split volunteer dnf dns".includes(x.status?.toLowerCase()))
        .map((x) => {
            // gun time
            let startTime = x.start_ts || (race?.timestamp?.start ? dayjs(race?.timestamp?.start) : null);
            const timestamp = typeof x.timestamp instanceof dayjs ? x.timestamp : dayjs(x.timestamp) 
            let elapsed=timestamp.diff(startTime, 's'),
                race_time=elapsedTo_HMS(elapsed)
            let gender =  getGender(x.gender )
            // console.debug(`${x.bib} ${startTime} ${timestamp} : ${elapsed} ${race_time}`)
            let resultRec= {
                Bib: x.bib,
                Name: x.name || `Athlete id# ${x.bib}`,
                Race: x.waypoint || ruleGuessWaypoint(x.bib,elapsed,race.Distances) ,
                Gender: gender,
                Category:
                    x.status == "valid" ? `${suffixK(x.waypoint)} - ${gender}` : `Other - ${x.status}`,
                "Start Time": startTime ? startTime.format(ts_fmt) : '-',
                "Race Time": race_time,
                "Finish Time": timestamp.format(ts_fmt),
                Status: x.status,
                Rank: "",
                // activity_key: 
            };
            return extend(resultRec,
                   pick(x,["activity","device_name","event","image"]))
        });

    // sorted by groups
    results = groupResultsByValidCategories(results);

    let ret = results.map((x) => ({
        cat: x.cat,
        entries: rankResultsByRaceTime(x.entries),
    }));

    // update each bib in the loop
    return {total: sumBy(ret, (x) => x.entries.length),
            timestamp: new Date().toISOString(),
            docs: ret
        }

};

function ruleGuessWaypoint(bib,elapsed,distances){
    let waypoint
    // valid paces for 5k/10k
    //if less than 50min assume 5k... Race admin to change later
    if ((elapsed<60*50) && distances.includes('5K')) 
        waypoint= '5K'
    if ((elapsed<60*60*2) && distances.includes('10K')) 
        waypoint= '10K'
    if (waypoint)
     console.warn(`distance overridden bib: ${bib} ${(elapsed/50).toFixed(0)}m to ${waypoint}`)
    return waypoint
}

function groupResultsByValidCategories(results) {

    return chain(results)
        .groupBy(x => `${x.Category}_${x.Status}`)
        .map((o, k) => ({
            cat: k,
            entries: sortBy(o, "Race Time")
        }))
        .filter(x => RegExp(/^\d+K?\D/).test(x.cat))
        // .tap(console.log)
        .value();
}

function rankResultsByRaceTime(x) {
    return _(x)
        .orderBy("Race Time")
        .map((x, i) => extend(x, { Rank: i + 1 }))
        .value();
}

/**
 * Need following
Bib "4002"  Athlete
Category "5K - Male" - Only distance 
Finish Time "06:43:00 GMT+0530 (India Standard Time)"
Gender "Male"
Name "NANDLAL YADAV"
Race "5K"
Race Time "00:37:44"
Rank 25
Start Time "06:05:15 GMT+0530 (India Standard Time)"
Status "valid" 
 */
function mapActivityToResult(doc, bibs){
    const ts_fmt="dddd DD-MMM-YYYY hh:mm:ssa"
    let data = doc.data();
    let [athlete,distance,activity] = doc.id.split("_")
    
    timestamp = dayjs(data.start_date_local);   
/**
 * 
    athlete 100075877
    device_name "Garmin Forerunner 55"
    distance 5000
    elapsed 2319
    event "create"
    sport_type "Run"
    start_date_local "2024-09-22T07:37:32Z"
    start_latlng
 */
    ret ={bib: athlete,
        timestamp: timestamp.add(data.elapsed,'second') , // end time
        waypoint: distance,
        start_ts: timestamp,
        end_ts: timestamp.add(data.elapsed,'second') , // end time
        activity: activity,
        // "Start Time": timestamp.format(ts_fmt) ,
        // Category: distance, // "5K - Male" - Only distance 
        // Activity: activity,
        // Gender : '-',
        // Race: distance,
        status: 'valid'
    }
    return extend(data,ret)


}

function elapsedTo_HMS(elapsed){
    if (elapsed<0) return `Invalid (${elapsed})`
    const getDivRem=(arr)=>[Math.floor(arr[0]/arr[1]),arr[0] % arr[1]]
    const pad_=(x)=>padStart(x,2,'0')
    let [d,h_]=getDivRem([elapsed,24*60*60])
    let [h,m_]=getDivRem([h_,60*60])
    let [m,s]=getDivRem([m_,       60])
    const days=d ? `${d} `:''
    return `${days}${pad_(h)}:${pad_(m)}:${pad_(s)}`
}

function mapReading(doc,bibs) {
    let regExp = getBibRegExp();
    let data = doc.data();
    data.id = doc.id;
    data.name = NOMATCH;

    if (!data.hasOwnProperty("bib") || doc.id.includes("START")) {
        debug("nonBib/START", data);
    } else if (data.bib.search(regExp) != -1) {
        // matching bib pattern

        data.status = data.status || ""; // 'valid'
        if (data.hasOwnProperty("timestamp")) {
            // console.warn(data.timestamp)
            data.timestamp = getDateZ(data.timestamp);
        }
        data.userId = data.userId || "Unknown";
        
        bibs
            .filter((x) => x.Bib == data.bib)
            .forEach((bib_found) => {
                data.name = bib_found.Name; //.Bib
                data.gender = bib_found.Gender;
                // if(data.bib=='3178')debugger;
                // console.log(`${data.bib}: ${bib_found.Name}`)
                if (
                    !data.status &&
                    !config.raceMgt.ingoredBibStatuses // if not of of these
                        .includes(bib_found.Status)
                )
                    data.status = bib_found.Status;
                // debugger
            });
    } else {
        data.status = "incorrect bib";
    }

    return (data) 
    // allEntries.value.push(data);

    // if (!waypoints.value.includes(data.waypoint)) waypoints.value.push(data.waypoint);
}

function addStatusFields(ret, raceStart) {
    // mark entries started before start of race
    ret = ruleRemoveEntriesBeforeStart(ret, raceStart);
    // bib match
    ret = map(ret, (x) => {
        if (["", "N/A"].includes(x?.name)) {
            x.status = "noname";
        }
        return x;
    });
    // all remaining
    ret = map(ret, (x) => {
        
        x.status = x.status || "valid";
        return x;
    });
    
    // const splitMap = uniqBy(allEntries.value, "waypoint").reduce((a, x) => {
    //     if (x?.waypoint) a[x.waypoint] = Number(x.waypoint.replace(/[KMkm]/g, ""));
    //     return a;
    // }, {});
    
    // ret = chain(ret)
    //        .orderBy(x=>x.bib+x.waypoint+x.timestamp,"asc")
    //        .reduce((a,o)=>{
    //             if ((o.status == 'valid') && a.some(
    //                   x=>x.bib+x.waypoint+x.status==o.bib+o.waypoint+o.status)){
    //               o.status='dup'
    //             } else if ((o.status == 'valid') && a.some(
    //                   x=>x.bib+x.status==o.bib+o.status)){
    //               o.status='split'
    //             }
    //             a.push(o)
    //             return a
    //         },[])
    //         .value()
    ret = checkRuleSplitDups(ret);

    return ret;
}


function checkRuleSplitDups(ret) {
    ret = orderBy(ret, (x) => x.bib + x.waypoint + x.timestamp, "asc")
        .reduce((a, o) => {
            if (o.status == "valid" &&
                a.some((x) => x.bib + x.waypoint + x.status == o.bib + o.waypoint + o.status)) {
                o.status = "dup";
            } else if (o.status == "valid" &&
                a.some((x) => x.bib + x.status == o.bib + o.status)) {
                o.status = "split";
            }
            a.push(o);
            return a;
        }, []);
    return ret;
}

function ruleRemoveEntriesBeforeStart(ret, raceStart) {
    ret = map(ret, (x) => {
        if (raceStart && x.timestamp < raceStart) {
            x.status = "prior"; //(x.status || "") + 
        }
        return x;
    });
    return ret;
}

/**
 * Convert to date adjusting for timezone
 */
function getDateZ(d) {
    if (d[d.length - 6])
        // e.g. +05:30
        return new Date(d);
    else if (d[d.length - 1] == "Z") return new Date(d);
    else return new Date(d + "Z");
}

function getBibRegExp() {
    return RegExp(/\d{4}/) ;
    return race?.value?.bibPattern ? RegExp(race?.value?.bibPattern) : false;
}

function getGender(gender) {
    const defaultGender="Male"
    gender = gender?.trim()
    
    // Doc: Gender not mentioned is considered as male
    if (["Male", "M"].includes(gender))
        return 'Male'
    if (["f","F", "Female"].includes(gender))
        return 'Female'
    else {
        // console.log(`default to ${defaultGender}`, entry.bib)
        return defaultGender
    }

}

function period(ts,startTime) {
    ts = typeof ts == "string" ? new Date(ts) : ts;
    try {
      let start = new Date(startTime);
      var diffTime = ts.valueOf() - start.valueOf();
    } catch {
      return "00:00:00";
    }
  
    try {
      // debug(diffTime)
      // let diffTime = Math.abs(new Date().valueOf() - new Date('2021-11-22T18:30:00').valueOf());
      let days_float = diffTime / (24 * 60 * 60 * 1000);
      let days = days_float < 0 ? Math.floor(days_float) : Math.floor(days_float);
      let hours = ((days_float - days ) % 1) * 24;
      let minutes = (hours % 1) * 60;
      let secs = (minutes % 1) * 60;
      [days, hours, minutes, secs] = [
        Math.floor(days),
        Math.floor(hours),
        Math.floor(minutes),
        Math.floor(secs),
      ];
      //${days}
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    } catch (e) {
      console.warn(`error ${ts} ${JSON.stringify(e)}`);
    }
  }
  
  let range = (i, j) =>
    [...Array(j).keys()].map((x) => x + i).filter((x) => x <= entries.value.length);
  let abbr = (x, len = 6) => String(x).substring(0, len);
  let pad = (x, n = 2) => ("00" + x).slice(-n);
  

module.exports = { finalize_results, 
    mapReading, 
    addStatusFields,
    checkRuleSplitDups,
    mapActivityToResult
 }