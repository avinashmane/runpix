process.env.NODE_ENV = 'test';

projroot={'win32':'/m/runpix',
            'linux':'/home/avinash/runpix'}[process.platform]

const cfg = {
    projectId: 'run-pix',
    baseUrl : 'http://localhost:5000/run-pix/us-central1/api',
    GS_URL_PREFIX: 'https://storage.googleapis.com/run-pix.appspot.com/',
    service_account: `${projroot}/functions/.serviceaccount.json`,
    firebaseConfig:{
        projectId:`run-pix`,
        storageBucket: `run-pix.appspot.com`,
        databaseURL: `https://run-pix.firebaseio.com`,
      }
}
const tst = {

}
const debug = require('debug')('TEST')
module.exports = {cfg,tst,debug,projroot}