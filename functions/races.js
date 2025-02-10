/**
 * races
 */
const _ = require("lodash");
const { firestore } = require("./firebaseUser");
const dayjs = require("dayjs");
const { debug } = require("./utils");
const raceTiming = require("./raceTiming");
const { log } = require("./utils");
const { scanVideoPath } = require("./videoocr")
/**
 * Races that are started
 * Not expired
 */

let activeRaces = {}

class Race {
    bucketName = 'run-pix.appspot.com' //gs://
    bucket = firestore
        .storage
        .bucket(this.bucketName)
    firestore=firestore.firestore
    constructor(id) {
        this.id = id
    }
    async getAttr() {
        return await firestore.doc(`/races/${this.id}`)
            .get()
            .then(snap => {
                if (snap.exists) {
                    const obj = snap.data()
                    Object.entries(obj)
                        .map(kv => this[kv[0]] = kv[1])
                    return { id: snap.id, ...obj }
                }
            })
    }
    async getCol(path) {
        return await firestore
            .getCol(`/races/${this.id}/${path}`,
                doc => ({ id: doc.id, ...doc.data() }))
    }

    async _deleteRaceDocument(path) {
        const doc=firestore.doc(`/races/${this.id}/${path}`)
        return await doc.delete()
    }

    async _deleteStorageDocument(fullPath){
        return await this.bucket.file(fullPath).delete()
    }
    /**
     * 
     * @param {*} path  /processed|uploadvid|thumbs|uploads/{raceID}
     * @returns 
     */
    async getBlobs(path, prefix = '') {
        const options = {
            prefix: `${path}/${this.id}/${prefix || ''}`,
        };
        // Lists files in the bucket, filtered by a prefix
        const [files] = await this.bucket
            .getFiles(options)
        return files.map(x => x.name)
    }

    async checkBlob(blobPath) {
        const blobPart = blobPath.split('/')
        if (blobPart[0] == 'uploadvid') {
            const path = `races/${this.id}/videos/${blobPart[2]}`
            try {
                return firestore.doc(path)
                    .get()
                    .then(async (snap) => {
                        if (snap.exists) {
                            console.log(`processed ${path}`,)//snap.data()

                        } else {
                            // console.log(`unprocessed ${path}`)
                            return await scanVideoPath(this.id, `gs://${this.bucketName}/${blobPath}`)
                        }
                        return {
                            blob: blobPath,
                            processed: snap.exists
                        }
                    })
            }
            catch (e) { console.error(e) }
        }
    }

    async getReadings(force = false) {
        return await this._getSubCollection('readings')
    }

    async getBibs(force = false) {
        return await this._getSubCollection('bibs')
    }

    async _getSubCollection(subPath,force = false) {
        this.readings = force ? await this.getCol(subPath) // forced refresh
                : (this.readings || await this.getCol(subPath)) // only if needed
        log(this.readings.length)
        return this.readings
    }

    async setSubDoc(subPath, data) {
        const path=`races/${this.id}/${subPath}`
        return await this.firestore.doc(path).set(data).then(console.log).catch(console.error)
    }
    async _deleteBlob(blobPath, dryRun = true) {
        try {
            const blobPart = blobPath.split('/')
            if (blobPart[0] == 'uploadvid') {
                const path = `races/${this.id}/videos/${blobPart[2]}`

                let readingsToDelete = await this.getReadings()
                        readingsToDelete=readingsToDelete.filter(x => x.imagePath == blobPart[2])

                if (dryRun) {
                    log(`not deleting ${path}`)
                } else {
                    log(`deleting ${path}`)
                    const blob_delete = await this._deleteStorageDocument(blobPath).catch(console.error)
                    let firestore_db_video = await firestore.doc(path).delete().catch(console.error)
                    return { firestore_db_video, blob_delete, readingsToDelete }

                }

            }
        } catch (e) {
            console.error(e)
        }
    }
}

async function readLiveRaces(
    status = ['live'],
    cutoffDays = 6
) {

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

async function createRace(id, group, template, data) {
    return await firestore.doc(`/races/${id}`).get().then(async snap => {
        if (!snap.exists) {
            await firestore.doc(`defaults/races/${group}/${template}`).get().then(async raceTemplate => {

                raceData = _.assign(raceTemplate.data(), data)

                const raceDoc = await firestore.doc(`/races/${id}`).set(raceData);

                return raceData;
            })
        } else {
            throw new Error(`Error Race ${id} already exists`)
        }
    })
}

async function createRaceNthSunday(group, template = "mychoice", weekNo = -1, DayNo = 0) {
    let nThSundayOfMonth = getNthSundayOfMonth(weekNo)
    const id = `${template}${nThSundayOfMonth.format("YYMMM")}`.toLowerCase();

    let data = {
        Date: nThSundayOfMonth.format('YYYY-MM-DD'),
        id: id
    }
    const ret = await createRace(id, group, template, data);

    return ret;
}


async function createSundayRace(group, template = "weekly") {
    comingSunday = dayjs().add(7, 'd').startOf('w')
    const id = `${template}-${comingSunday.format("YY-MM-DD")}`.toLowerCase();
    let data = {
        Date: comingSunday.format('YYYY-MM-DD'),
        id: id
    }
    const ret = await createRace(id, group, template, data);

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
    firestore.doc(`races/${race}`)
        .onSnapshot(snap => {
            race_cfg[race] = snap.data();
            debug(`load ${race}`, race_cfg[race]);
            return race_cfg[race];
        });
    // function below waits 3 seconds
    return await new Promise(resolve => setTimeout(resolve, 1000))
        .then(() => race_cfg[race]);
};

async function save_result(raceId, options) {

    const race = await getRaceCfg(raceId);
    const bibs = await firestore.getCol(`/races/${raceId}/bibs`,
        doc => (Object.assign({ id: doc.id }, doc.data())));
    const data = await firestore.getCol(`/races/${raceId}/readings`,
        doc => raceTiming.mapReading(doc, bibs));


    const allEntries = raceTiming.addStatusFields(data,
        race?.timestamp?.start);

    const ret = raceTiming.finalize_results(allEntries, race);

    let stats = {
        bibs: bibs.length,
        readings: data.length,
        results: ret.length || 0,
        savedResults: 0
    };
    // Save all entries
    ret.docs.forEach((category) => {
        log(`saving ${category.entries.length} entries for ${category.cat}`);
        category.entries.forEach((x) => {
            try {
                // console.log(`${x.Rank} ${x.Name} ${x['Race Time']}`)
                firestore.doc(`races/${raceId}/result/${x.Bib}`)
                    .set(x)
                    .then(x => { stats.savedResults++; })
                    .catch(console.error);

            } catch (e) {
                console.error("error saving", e);
            }
        });
    });

    // update /races
    firestore.doc(`races/${raceId}`).update({
        "timestamp.result": new Date().toISOString(),
        stats: stats
    });
    return stats;
}


// exports.getRaceCfg = getRaceCfg;

module.exports = {
    readLiveRaces,
    createRaceNthSunday,
    createRace,
    createSundayRace,
    getRaceCfg,
    race_cfg,
    Race,
    save_result
};
