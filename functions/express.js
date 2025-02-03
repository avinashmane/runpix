
const debug = require("debug")("RUNPIX:SERVER")
const { createRaceNthSunday,createSundayRace } = require("./races")
/**
 * all express app related things
 */
const express = require('express');
const exphbs = require('express-handlebars');
var morgan = require('morgan')
const app = express();


app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// app.use("/dist",express.static('../dist'))
app.use(morgan('tiny'))
//  app.use(firebaseUser.validateFirebaseIdToken);

/**
* Get dynamic page showing the image
* Need page url, photo url, thumb url, link event/bib search,
*/
app.get('/image/:imagePath', async (req, res) => {
  //test link http://localhost:5000/image/d2VydW4yMDIzLzUwMzEvMjAyMy0wMy0xM1QxNjozODowMy41Njg5NzN+Z2VuZXJhbH52YWliaGF2flNfRzAzMDAzLmpwZw==
  let p = await mapParams(req.params);
  return renderImage(res, req, p,);
});


app.get('/image/:raceId/:bibNo/:imagePath', async (req, res) => {
  //test link http://localhost:5000/image/werun2023/5031/2023-03-13T16:38:03.568973~general~vaibhav~S_G03003.jpg    
  let p = await mapParams(req.params)
  return renderImage(res, req, p,);
});

function renderImage(res, req, p) {
  // preview URL same is image URL
  if (p.imageUrl) p.previewUrl = p.imageUrl;

  return res.render('image', p); //{
  //   imageUrl: p.imageUrl,
  //   previewUrl: p.imageUrl,
  //   bibNo: p.bibNo,
  //   raceId: p.raceId,
  //   pageUrl: p.pageUrl,
  //   raceOrg: p.raceOrg
  //   params: JSON.stringify(req.params),
  // });
}

app.post('/race/:raceId/results', async (req, res) => {
  //test link http://localhost:5000/race/werun2023
  const _ret = await save_result(req.params.raceId, req.query)
  console.log(req.params.raceId, _ret)
  res.status(200).send(_ret)

});
/**
* Map parameters and also read race from firebase
* @param {*} params 
* @returns 
*/
async function mapParams(params) {
  // log(params)
  let p = { raceId: null, bibNo: null, imagePath: null };//raceId,bibNo,imagePath;
  if (!params.raceId) {
    let buff = new Buffer.from(params.imagePath, 'base64');
    [p.raceId, p.bibNo, p.imagePath] = buff.toString('ascii').split('/');

  } else {
    p.raceId = params.raceId
    p.bibNo = params.bibNo
    p.imagePath = params.imagePath
  }

  let race = await getRaceCfg(p.raceId);
  p.Name = race.Name
  p.Location = race.Location
  p.raceDate = (race.Date && race.Date.length > 10) ? race.Date.substring(0, 10) : race.Date
  p.linkOrg = race.linkOrg
  p.raceOrg = race.raceOrg
  p.timeImage = new Date(p.imagePath.split("~")[0])
  // sample image "https://storage.googleapis.com/run-pix.appspot.com/processed/werun2023/2023-03-13T16:38:03.568973~general~vaibhav~S_G03003.jpg"
  p.imageUrl = `${GS_URL_PREFIX}processed/${p.raceId}/${p.imagePath.replace(/\.jpg|\.png/, JPEG_EXTENSION)}`;
  //  log('Signed-in user:', user);
  p.pageUrl = `https://run-pix.web.app/p/${p.raceId}/${p.bibNo}`
  return p
}

app.post('/race', async (req, res) => {
  // @ts-ignore
  //test link http://localhost:5000/race/werun2023
  let ret
  debug(req.query, req.params, req.body,)
  if (req.query.monthly) {
    ret = createRaceNthSunday(req.query.group, req.query.template, req.query.weekno)
  } else { // Weekly
    ret = createSundayRace(req.query.group, req.query.template)
  }
  res.status(200).send(ret)

})
app.get('/race/:raceId', async (req, res) => {
  // @ts-ignore
  //test link http://localhost:5000/race/werun2023
  const _raceObj = await getRaceCfg(req.params.raceId);
  debug(req.params.raceId, _raceObj)
  res.status(200).send(_raceObj);

})


app.post('/event2', async (req, res) => {
  // @ts-ignore
  //test link http://localhost:5000/race/werun2023
  console.log(req.query, req.params, req.body,)
  res.status(200).send(true)

});

app.get('/healthcheck', async (req, res) => {
  res.status(200).send({
    // race_cfg:await getRaceCfg(req.query?.raceId),
    date: new Date()
  });
});

app.get('*', function (req, res) {
  debug('* 404')
  res.status(404).send(`Error finding the resource for the URL ${req.url}
  <br/>
  Data: ${JSON.stringify(req.params)}`);
})

exports.app = app;