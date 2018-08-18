const request = require('request');
const dbkey = require('./config.json').db_key;

var getOpts = {
  'headers': {
      'cache-control': 'no-cache',
      'x-apikey': dbkey
  }
};

request.get(`https://subjectselect-36c2.restdb.io/rest/availablesubjects?q={"schoolCode": "pbcf65"}`, getOpts, (err, rsp, body) => {
  console.log(body);
});