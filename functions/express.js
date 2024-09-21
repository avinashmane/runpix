const { app, getRaceCfg } = require('.')
const debug = require("debug")("SERVER")
/**
 * all express app related things
 */


app.get('/race/:raceId', async (req, res) => {
  // @ts-ignore
  //test link http://localhost:5000/race/werun2023
  const _raceObj = await getRaceCfg(req.params.raceId);
  debug(req.params.raceId, _raceObj)
  res.status(200).send(_raceObj);

});

app.get('/healthcheck', async (req, res) => {

    res.status(200).send({date:new Date().toDateString()});
  
  });
  
app.get('*', function (req, res) {
  debug('* 404')
  res.status(404).send(`Error finding the resource for the URL ${req.url}
  <br/>
  Data: ${JSON.stringify(req.params)}`);
});  


app.set('port', process.env.PORT || 8080);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

