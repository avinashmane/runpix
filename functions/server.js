const { app } = require("./express")
const debug = require("debug")("RUNPIX:SERVER")


app.set('port', process.env.PORT || 8080);

function setupHttps(app) {
  const https = require('https');
  const fs = require('fs');
  var key = fs.readFileSync(__dirname + '/../certs/selfsigned.key');
  var cert = fs.readFileSync(__dirname + '/../certs/selfsigned.crt');
  var options = {
    key: key,
    cert: cert
  };
  return https.createServer(options, app);
}

var server = setupHttps(app)

server.listen(app.get('port'), function () {
  console.debug('Express server listening on port ' + server.address().port);
});