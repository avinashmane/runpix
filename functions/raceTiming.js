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
    pickBy,
    uniqBy,
    split,
    sortBy,
    tap,
    extend,
    startsWith,
  } = require("lodash");
  const _ = require("lodash");
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
    
    console.log(`finalizing results: ${allEntries.length}`);
    const keys_ = split("bib name timestamp status waypoint gender imagePath", " ");
    
    suffixK=(x)=>typeof x === "string" ? x.replace(/(\d+)(k?)/i,"$1K") : x
    
    // map data
    let results = allEntries
        .filter((x) => x.waypoint != "VENUE")
        .filter((x) => "valid split volunteer dnf dns".includes(x.status.toLowerCase()))
        .map((x) => {
            // gun time
            let startTime = race?.timestamp?.start
                ? new Date(race?.timestamp?.start).toTimeString()
                : "-";
            // debug(typeof x.timestamp)
            return {
                Bib: x.bib,
                Name: x.name,
                Race: x.waypoint,
                Gender: x.gender,
                Category:
                    x.status == "valid" ? `${suffixK(x.waypoint)} - ${getGender(x)}` : `Other - ${x.status}`,
                "Start Time": startTime,
                "Race Time": period(x.timestamp,race?.timestamp?.start),
                "Finish Time":
                    typeof x.timestamp == "string" ? x.timestamp : x.timestamp.toTimeString(),
                Status: x.status,
                Rank: "",
            };
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

    // Save all entries
    ret.forEach((category) => {
        console.log(`saving ${category.entries.length} entries for ${category.cat}`);
        category.entries.forEach((x) => {
            try {
                // console.log(`${x.Rank} ${x.Name} ${x['Race Time']}`)
                setDoc(doc(db, "races", raceId, "result", x.Bib), x).then(
                    (x) => processedFinalizedEntries.value++
                );
            } catch (e) {
                console.error("error saving", e);
            }
        });
    });


    // updateDoc(doc(db, `races/${raceId}`), {
    //     "timestamp.result": new Date().toISOString(),
    // });

    function rankResultsByRaceTime(x) {
        return _(x)
            .orderBy("Race Time")
            .map((x, i) => extend(x, { Rank: i + 1 }))
            .value();
    }

    function groupResultsByValidCategories(results) {
        // let ret = groupBy(results, (x) => `${x.Category}_${x.Status}`)
        // ret= each(ret,(o, k) => ({
        //     cat: k,
        //     entries: sortBy(o, "Race Time"),
        //   }))
        // ret = pickBy(ret,(x) => RegExp(/^\d+K\D/).test(x.cat));
        // return ret
        return chain(results)
            .groupBy(x => `${x.Category}_${x.Status}`)
            .map((o, k) => ({
                cat: k,
                entries: sortBy(o, "Race Time")
            }))
            .filter(x => RegExp(/^\d+K?\D/).test(x.cat))
            .tap(console.log)
            .value();
    }
};

function updateTiming(race, timestamp,) {

}

function mapReading(doc,bibs) {
    let regExp = getBibRegExp();
    let data = doc.data();
    data.id = doc.id;
    data.name = NOMATCH;

    if (!data.hasOwnProperty("bib") || doc.id.includes("START")) {
        console.log("nonBib/START", data);
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
    ret = map(ret, (x) => {
        if (raceStart && x.timestamp < raceStart) {
            x.status = (x.status || "") + "prior";
        }
        return x;
    });
    // bib match
    ret = map(ret, (x) => {
        if (["", "N/A"].includes(x?.name)) {
            x.status = "noname";
        }
        return x;
    });
    // all remaining
    ret = map(ret, (x) => {
        //if(x.bib=='3178')debugger;
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
    ret = orderBy(ret, (x) => x.bib + x.waypoint + x.timestamp, "asc")
        .reduce((a, o) => {
            if (
                o.status == "valid" &&
                a.some((x) => x.bib + x.waypoint + x.status == o.bib + o.waypoint + o.status)
            ) {
                o.status = "dup";
            } else if (
                o.status == "valid" &&
                a.some((x) => x.bib + x.status == o.bib + o.status)
            ) {
                o.status = "split";
            }
            a.push(o);
            return a;
        }, []);

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

function getGender(entry) {
    let gender = entry?.gender?.trim()
    
    // Doc: Gender not mentioned is considered as male
    if (["Male", "Female"].includes(gender))
        return gender
    else {
        console.log('default to Male', entry)
        return "Male"
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
  

module.exports = { finalize_results, mapReading, addStatusFields }