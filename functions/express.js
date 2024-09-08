const { app, getRaceCfg } = require('.')

/**
 * all express app related things
 */


app.get('/race/:raceId', async (req, res) => {
  // @ts-ignore
  //test link http://localhost:5000/race/werun2023
  const _raceObj = await getRaceCfg(req.params.raceId);
  // console.log(req.params.raceId, _raceObj)
  res.status(200).send(_raceObj);

});

app.get('/healthcheck', async (req, res) => {

    res.status(200).send({date:new Date().toDateString()});
  
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

exports.renderImage = renderImage;

