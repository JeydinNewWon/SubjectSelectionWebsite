const request = require('request');

var tempValue = {
    'email': 'jayden.nguyen@sydstu.catholic.edu.au',
    'password': 'me',
    'school': 'PBCF'
}

/*
var opts = {
    'headers': {
        'x-apikey': '6724f5d80ea5fabdcb0a8f84a6149003d6f51',
        'cache-control': 'no-cache',
        'content-type': 'application/json'
    },
    'body': JSON.stringify(tempValue)
}*/

var opts = {
    'headers': {
        'cache-control': 'no-cache',
        'x-apikey': '6724f5d80ea5fabdcb0a8f84a6149003d6f51',
        'content-type': 'application/json'
    }
}

request.get("https://subjectselect-36c2.restdb.io/rest/studentlogin?q={\"email\" : \"jayden.nguyen@sydstu.catholic.edu.au\"}", opts, (err, rsp, body) => {
    if (rsp)
        console.log(rsp.statusCode);

    console.log(JSON.parse(body));
});
