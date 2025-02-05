<template>
  <Toast/>

  <Card id="provisional" class="bg-white">
    <template #title> Provisional Timing {{ raceId }} </template>
    <template #content>
      <div>
        Start: {{ race?.timestamp?.start?.toLocaleString() || isLive() ? 'Live' : '--'}} 
        <!-- <InputMask v-model="startTime" 
        dateTimeFormat="YYYY-MM-DD HH:mm:SS" placeholder="YYYY-MM-DD HH:MM:SS" mask="9999-99-99 99:99:99"/> -->
      </div>

      <div id="selections" class="flex align-items-center">
        <!-- <label for="showAll" class="ml-2">All:</label> -->
        <Select
          :options="showAllOptions"
          v-model="showAll"
          inputId="showAll"
          value="showAll"
        />
        <Select :options="waypoints" v-model="selWpt" />
        <!-- <Select :options=bibsOptions v-model="bibsVal"/> -->
        <Select :options="genderOptions" v-model="genderVal" />
      </div>

      <div id="sort" class="flex align-items-center">
        <Select :options="sortOptions" v-model="sortVal" />
        <InputText v-model="bibSearch" />
      </div>

      <Paginator
        v-model:first="first"
        v-model:rows="rows"
        :totalRecords="entries.length"
        template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first}-{last} of {totalRecords}"
      />
      <table class="w-full">
        <tr>
          <th v-for="h in ['TS', 'Time', 'Bib', 'WP', 'U']">{{ h }}</th>
        </tr>
        <tr v-for="i in range(first, rows)">
          <template v-if="entries[i]">
            <td>
              {{ i + 1 }}
              <br />
              <i
                @click="toggleDialog(i)"
                class="pi pi-pencil"
                :class="entries[i].status"
              />
            </td>
            <td>
              {{ formatDate(entries[i].timestamp) }}
              <br />
              <i>{{ isLive()
                  ? dayjs.duration(entries[i].elapsed,"s").format('HH:mm:ss') 
                  : period(entries[i].timestamp) }}</i>
            </td>
            <td>
              <span :class="entries[i].status">{{ entries[i].bib }}</span>

              <small>&nbsp;{{ entries[i].status }}</small>
              <br />
              <small>{{ abbr(entries[i].name, 24) }}</small>
              <!-- <b>{{entries[i].score}}</b> -->
            </td>
            <td>
              {{ entries[i].waypoint }}
              <small>
                <u>{{ isLive()
                  ? entries[i].device_name
                  : abbr(entries[i].userId) }}</u>
              </small>
            </td>
            <td v-if="isLive()" class="image w-20%">
              <Image
                v-if="entries[i].imagePath"
                preview
                :src="GS_PREFIX + entries[i].imagePath.replace('processed', 'thumbs')"
              />
              <span v-else
                ><small>{{ entries[i].type }}</small></span
              >

            </td>
            <td class="w-1/12">
              <a :href="'https://www.strava.com/activities/'+entries[i].activity" target="_blank"><i
                class="pi pi-external-link"
              /></a>
            </td>
          </template>
        </tr>
      </table>

      <Dialog v-model:visible="visible" modal header="Please review carefully">
        <div>
          <div v-if="entries[entryToEdit].imagePath">
            <Image :src="GS_PREFIX + entries[entryToEdit].imagePath" />
          </div>
          <tr v-if="race" >
            <td>{{ race.status }}</td>
            <td>
              {{
                race.timestamp
                  ? `${new Date(race.timestamp.start).toLocaleTimeString()} "${
                      race.timestamp.start
                    }"`
                  : ""
              }}
            </td>
          </tr>
          <tr
            v-for="(v, k) in { userId: 'User', id: 'Id', score: 'Score' }"
            @dblclick="klick"
          >
            <td>{{ v }}</td>
            <td>{{ entries[entryToEdit][k] }}</td>
          </tr>
          <tr
            v-for="(v, k) in {
              bib: 'Bib',
              status: 'Status [valid or invalid]',
              waypoint: 'Waypoint',
              type: 'Type',
            }"
          >
            <td>{{ v }}</td>
            <td>
              <InputText
                stype="k=='timestamp'?'datetime-local':'text'"
                v-model="entries[entryToEdit][k]"
              />
            </td>
          </tr>
          <tr>
            <td>Timestamp</td>
            <td>
              <InputText
                nontype="datetime-local"
                v-model="entries[entryToEdit].timestamp"
              />
              {{ formatDate(entries[entryToEdit].timestamp) }}
            </td>
          </tr>
          <!-- {{period(entries[entryToEdit].timestamp))}} -->
        </div>
        <p>Total entries {{ allEntries.length }}</p>
        <template #footer>
          <Button
            v-if="entries[entryToEdit].status != 'invalid'"
            label="Invalidate"
            @click="
              setStatus(entries[entryToEdit].id, 'invalid');
              visible = false;
            "
            text
          />
          <Button
            v-if="entries[entryToEdit].status != 'valid'"
            label="Validate"
            @click="
              setStatus(entries[entryToEdit].id, 'valid');
              visible = false;
            "
            text
          />
          <Button label="No" icon="pi pi-times" @click="visible = false" text />
          <Button
            label="Save"
            @click="
              submitChange();
              visible = false;
            "
            icon="pi pi-check"
            autofocus
          />
        </template>
      </Dialog>
    </template>

    <template #footer>
      <div class="flex flex-row justify-around align-items-center">
        <Button @click="router.back()" icon="pi pi-chevron-left"></Button>
        <Button @click="finalize_results">Finalize (old)</Button>
        <Button @click="finalize_results_server()">Finalize (server)</Button>
        <Button @click='resetResults()' @dblclick="klick">Reset results</Button>
        <!-- <Button @click='showToast()' @dblclick="klick">Toast</Button> -->
        <!-- {{  race  }} -->
      </div>
      <div v-if="totalFinalizedEntries">
        {{ processedFinalizedEntries }} / {{ totalFinalizedEntries }} entries processed
      </div>
    </template>
  </Card>
</template>

<script setup>

import { computed, ref, onBeforeUnmount } from "vue";
// import { useStore } from "vuex";
import { useRaceStore } from "../stores";
import { useRoute, useRouter } from "vue-router";
import axios from 'axios';
import Paginator from "primevue/paginator";
import Image from "primevue/image";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Select from "primevue/select"; // optional
// import TabView from 'primevue/tabview';
// import TabPanel from 'primevue/tabpanel';
import Card from "primevue/card"; // optional
import { db, storage } from "../../firebase/config"; //storage
import { config } from "../config";
import {
  collection,
  query,
  doc,
  limit,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import {
  chain, cloneDeep,  map,  orderBy as _orderBy,  sumBy,  pickBy,  uniqBy,  
  split,  sortBy,  tap,  extend,  startsWith,} from "lodash-es";
import {debug} from "../helpers"
import _ from 'lodash-es'
import dayjs from "dayjs"
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
import {storeToRefs} from 'pinia'

const GS_PREFIX = config.GS_PREFIX;
const NOMATCH = "N/A";
// const store = useStore();
const raceStore = useRaceStore();
const route = useRoute();
const router = useRouter();
const raceId =  route.params.raceId;
raceStore.setRaceId(raceId)
// store.dispatch("getRaceObjAction", raceId);

const racesObj = raceStore.racesObj//store.state.datastore.racesObj;
const {race} = storeToRefs(raceStore)//computed(() => store.state.datastore.race);

const bibsOptions = ["Matched", "Pattern", "All", NOMATCH]; //matched
const bibsVal = ref("All"); //matched
const showAll = ref("Valid");
const showAllOptions = ["All", "Valid", "Invalid"];
const genderOptions = ["All", "Male", "Female"];
const genderVal = ref("All");
const sortOptions = ["Desc", "Asc"];
const sortVal = ref("Asc");
const bibSearch = ref("");
const waypoints = ref(["All"]); // availably waypoints
const selWpt = ref("All"); // selected waypoints (for display)

const allEntries = ref([]);
let bibs = ref([]);
let raceDoc = doc(db, "races", raceId); //


function isLive(){
  return race.value?.status?.includes('live')
}
const getReadingsPath=()=>isLive()?"activities":"readings"

const totalFinalizedEntries = ref(null);
const processedFinalizedEntries = ref(0);
const startTime = computed(() => {
  try {
    return new Date(race?.timestamp?.start);
  } catch (e) {
    return "";
  }
});
let unsubscribe_readings;
let toastNewUpdates

// fetch bibs
const unsubscribe_bibs = onSnapshot(
  query(collection(raceDoc, "bibs")),
  (querySnapshot) => {
    querySnapshot.forEach((x) => bibs.value.push(x.data()));
    // debug(bibs.value)
    // fetch readings
    unsubscribe_readings = onSnapshot(
      query(collection(raceDoc,getReadingsPath() ), 
            // isLive() ? null : orderBy("timestamp", "desc") // 
      ),(querySnapshot) => {
        // console.log(querySnapshot.docs)
        allEntries.value = [];
        if(isLive())
          querySnapshot.forEach(mapActivity);
        else
          querySnapshot.forEach(mapReading);

        allEntries.value = addStatusFields(allEntries.value);

        if (toastNewUpdates)
          toastBib(querySnapshot)
        else
          toastNewUpdates=true
      }
    );
  }
);

onBeforeUnmount(()=> {
   // Perform cleanup here
  if (unsubscribe_readings){
    unsubscribe_readings()
    console.log('unsubscribe_readings unsubscribed');
  }
  if (unsubscribe_bibs){
    unsubscribe_bibs()
    console.log('unsubscribe_bibs unsubscribed');
  }
})

function toastBib(querySnapshot){
  querySnapshot.docChanges().forEach(change => {
      const data=change.doc.data()
      if (change.type === 'added') {
        showToast(`${data.bib} @ ${data.waypoint}`,period(data.timestamp))
        console.log('New  ', data);
      }
      if (change.type === 'modified') {
        showToast(`CHG ${data.bib} @ ${data.waypoint}`,period(data.timestamp),"info")
        console.log('Modified  ', data);
      }
      if (change.type === 'removed') {
        showToast(`REM ${data.bib} @ ${data.waypoint}`,period(data.timestamp),"warning")
        console.log('Removed  ', data);
      }
    });
}

let entries = computed(() => {
  let ret = cloneDeep(allEntries.value)
                .filter((x) => !x.id.includes("_START_")); // remove start entries
  //common filters
  if (selWpt.value && selWpt.value != "All") {
      ret = ret.filter((x) => x.waypoint == selWpt.value);
  }

  // show All or only valid
  if (showAll.value == "Valid") {
    // debugger
    ret = ret.filter((x) => x.status == "valid");
  }
  if (showAll.value == "Invalid") {
    ret = ret.filter((x) => !(x.status == "valid"));
  }
  if (["Male", "Female"].includes(genderVal.value)) {
      ret = ret.filter((x) => x.gender == genderVal.value);
  }

    // sort
  // debugger

  ret = _orderBy(ret, "timestamp", sortVal.value.toLowerCase());

  // search text debugger
  if (bibSearch.value)
    ret = ret.filter(
      (x) =>
        x.bib.includes(bibSearch.value) ||
        x.name.includes(bibSearch.value) ||
        x.status.includes(bibSearch.value)
    );

  
  if(isLive()){ // Live/virtual race...activities

    return ret

  } else { // readings
    
    // status with status from bib
    const bibRegExp = getBibRegExp();
    console.log(`selected ${ret.length}/${allEntries.value.length} v:${showAll.value} d:${selWpt.value} g:${genderVal.value} s:${sortVal.value} b:${bibsVal.value}`);
    // name or pattern matched
    const matchBib = (x) => {
      const patMatch = x.bib.match(bibRegExp);
      // console.warn(`${x.bib}:${patMatch?1:0}||${x.name}>>${patMatch || (x.name!=NOMATCH)}`)
      return patMatch || x.name != NOMATCH;
    };

    if (bibsVal.value == "Matched") {
      ret = ret.filter((x) => !["", "N/A"].includes(x?.name)); // not in this list
    } else if (bibsVal.value == "Pattern") {
      ret = ret.filter(matchBib);
    } else if (bibsVal.value == "N/A") {
      ret = ret.filter((x) => !matchBib(x));
    }

    return ret;
  }
});

function addStatusFields(ret) {
  // mark entries started before start of race
  ret = map(ret, (x) => {
    if (race?.timestamp?.start && x.timestamp < race?.timestamp?.start) {
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
  // dup
  // debugger
  const splitMap = uniqBy(allEntries.value, "waypoint").reduce((a, x) => {
    if (x?.waypoint) a[x.waypoint] = Number(x.waypoint.replace(/[KMkm]/g, ""));
    return a;
  }, {});

  ret = _orderBy(ret, (x) => x.bib + x.waypoint + x.timestamp, "asc")
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
function mapActivity(doc){
  let data = doc.data();
  data.id = doc.id;
  const id_splits = doc.id?.split('_'); 
  data.waypoint=id_splits[1];
  data.bib=id_splits[0]
  data.timing = data.timestamp;
  data.name = data.name || data.email;
  data.timestamp = (data.start_date_local);
  data.gender=getGender(data)
  // else /** if (data.gender=='M') */ data.gender='Male'
  
  allEntries.value.push(data);

  if (!waypoints.value.includes(data.waypoint)) waypoints.value.push(data.waypoint);
}

function mapReading(doc) {
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
    bibs.value
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

  allEntries.value.push(data);

  if (!waypoints.value.includes(data.waypoint)) waypoints.value.push(data.waypoint);
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

function klick() {
  debugger;
}

// Paginator
const first = ref(0);
const rows = ref(10);

const tsOptions = {
  // year: "numeric",
  // month: "numeric",
  // day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};

const formatDate = (value) => {
  if (!value) return "--:--:--";
  try {
    // debug(value)
    value = new Date(cloneDeep(value)); //-new Date(props.race.timestamp.start)
    return value.toLocaleString("en-US", tsOptions);
  } catch (e) {
    console.error(`error ${value}`);
  }
};

function period(ts) {
  ts = typeof ts == "string" ? new Date(ts) : ts;
  try {
    let start = new Date(race.value.timestamp.start);
    var diffTime = ts.valueOf() - start.valueOf();
  } catch {
    return "00:00:00";
  }

  try {
    // debug(diffTime)
    // let diffTime = Math.abs(new Date().valueOf() - new Date('2021-11-22T18:30:00').valueOf());
    let days_float = diffTime / (24 * 60 * 60 * 1000);
    let days = days_float < 0 ? Math.floor(days_float) : Math.floor(days_float);
    let hours = ((days_float - days * (24 * 60 * 60 * 1000)) % 1) * 24;
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

// dialog
const visible = ref(false);
const entryToEdit = ref(null);
function toggleDialog(i) {
  debug(`toggleDialog: ${i}`);
  if (entryToEdit) {
    entryToEdit.value = i;
    visible.value = true;
  } else {
    entryToEdit.value = false;
    visible.value = false;
  }
}

const setStatus = (id, val) => {
  const e = allEntries.value.filter((x) => x.id == id);
  try {
    e[0].status = val;
    // debugger
    const path = `races/${raceId}/${getReadingsPath()}/${id}`;
    return updateDoc(doc(db, path), { status: val });
  } catch (err) {
    console.error(err);
  }
};

function submitChange() {
  let regExp = getBibRegExp();

  if (entries.value[entryToEdit.value].bib.search(regExp) >= 0) {
    let payload = cloneDeep(entries.value[entryToEdit.value]);
    let path = `races/${raceId}/${getReadingsPath()}/${payload.id}`;
    delete payload.id;
    // debugger
    // debug(typeof payload.timestamp, payload.timestamp)
    payload.timestamp = new Date(payload.timestamp).toISOString();
    debug(`Saving ${JSON.stringify(payload)}`);

    updateDoc(doc(db, path), payload);
  } else {
    console.warn(`Non bib found `);
  }
}

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
 // this should be done in backend one logic
function finalize_results() {
  console.log(`finalizing results: ${allEntries.value.length}`);
  const keys_ = split("bib name timestamp status waypoint gender imagePath", " ");

  // map data
  let results = allEntries.value
    .filter((x) => x.waypoint != "VENUE")
    .filter((x) => "valid split volunteer dnf dns".includes(x.status.toLowerCase()))
    .map((x) => {
      let startTime = race.value?.timestamp.start
        ? new Date(race.value?.timestamp.start).toTimeString()
        : "-";
      // debug(typeof x.timestamp)
      return {
        Bib: x.bib,
        Name: x.name,
        Race: x.waypoint,
        Gender: x.gender,
        Category:
          x.status == "valid" ? `${x.waypoint} - ${getGender(x)}` : `Other - ${x.status}`,
        "Start Time": startTime,
        "Race Time": period(x.timestamp),
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
  totalFinalizedEntries.value = sumBy(ret, (x) => x.entries.length);

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

  updateDoc(doc(db, `races/${raceId}`), {
    "timestamp.result": new Date().toISOString(),
  });

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
      .filter(x => RegExp(/^\d+K\D/).test(x.cat))
      .tap(console.log)
      .value();
  }
}

function getBibRegExp() {
  return race.value?.bibPattern ? RegExp(race.value?.bibPattern) : false;
}

function getGender(entry) {
  let gender = entry?.gender?.trim()
  // if( /Manoj/i.test(entry.name)) 
  //   console.log(entry.name, entry.gender,gender)
  // Doc: Gender not mentioned is considered as male
  if (["Male","Female"].includes(gender))
    return gender
  else
  {
    console.log('default to Male', entry)
    return "Male" 
  }
  
}

/** Toast */
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const showToast = (summary,mesg,severity) => {
    toast.add({ //severity: severity||'success', 
                summary: summary||'Bib missing', 
                detail: mesg||'Message Content', life: 2000 });
};

function finalize_results_server(){
  const url=`${config.app.API_URL}/race/${raceId}/results`

  return axios
    .post(url, {}, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((ret) => {
      console.log("test result", ret);
      return ret;
    })
    .catch((e) => {
      console.warn( e);
    });
}

function resetResults(bib=null){
  const deleteRef=(ref)=>{
          ret =deleteDoc(ref);
          console.log(ref.path)
          return ret
        }
  
  if (bib){
    
    return deleteDoc(doc(raceDoc,'result',bib))

  } else { // b=null ie all entries

    const col=collection(raceDoc,'result' )
    return onSnapshot(
      query(col, ), (querySnapshot) => {
        // console.log(col.path,querySnapshot.docs)
        querySnapshot.forEach(x=>deleteRef(x.ref));

      })
    }
}


</script>

<style scoped>
td.image {
  max-width: 2em;
}

i {
  color: blue;
}
i.valid {
  color: green;
}

.invalid {
  color: red;
}
div#selections ::v-deep(span) {
  padding: 1px;
  color: blue;
}
.p-paginator {
  padding: 0px;
}
span.valid {
  color: blue;
}
span.noname {
  color: red;
}
span.dup {
  color: gray;
}
span.invalid {
  text-decoration: line-through;
}
</style>
