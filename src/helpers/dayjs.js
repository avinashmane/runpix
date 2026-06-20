import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(utc)


function getDateTime(datetime) {
    let date=datetime? new Date(datetime) : new Date()
    return date.toISOString().replace(/[\-:\.]/g,"").split(/[TZ]/g).slice(0,2) 
}

function getLocalDateTime(datetime) {
    let date=datetime? new Date(datetime) : new Date()
    return date.toLocaleString()
}

function nextNthSunday(n=1){
	return dayjs().add(n, 'weeks').startOf('week').format('YYYY-MM-DD')
}

/**
 * Used from extracing timestamp from filename
 * \D*(20\d{2})(\d{2})(\d{2})_{0,1}(\d{2})(\d{2})(\d{2})\D*
 * (IMG|VID)_{0,1}(20\d{6})_{0,1}(\d{6})\.(mp4|png|jpg|jpeg)
 * @param {*} str 
 * returns timestamp...local timezone assumed
 * 
 * test data: VID20250209070427.mp4
VID_20250209_070427.mp4
IMG_20250209_070427.mp4
IMG20250209070427.mp4
 */
const patt=RegExp(/\D*(20\d{2})(\d{2})(\d{2})_{0,1}(\d{2})(\d{2})(\d{2})\D?.*/)
function getTimeStampFromStr(str){
     const m=patt.exec(str)
     if (m.length<7) {
        console.error(`getTimeStampFromStr() timestamp not found`)
        return str
    }
     return new Date(`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`).toISOString()
}

export function isIsoDate(str) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
    const d = new Date(str); 
    return !isNaN(d.getTime()) && d.toISOString()===str; // valid date 
  }
  
export {getDateTime,getLocalDateTime,nextNthSunday,getTimeStampFromStr,
	dayjs}

