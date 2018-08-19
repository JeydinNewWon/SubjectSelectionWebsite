const request = require('request');
const config = require('../config.json');
const studentSelectionKey = config.db_key;

var opts = {
    'headers': {
        'cache-control': 'no-cache',
        'x-apikey': studentSelectionKey,
    }
}

request.get('https://subjectselect-36c2.restdb.io/rest/schoolsubjects?q={"schoolCode": "pbcf65"}', opts, (err, rsp, body) => {
    var subjectList = JSON.parse(body)[0].subjectList;

    console.log(subjectList);
    var notRemoved = [];
    var id = JSON.parse(body)[0]._id;
    subjectList.forEach((subject) => {
        console.log(subject.name)
        if (subject.name !== "Hair Dressing" && subject.name !== "example" && subject.name !== "example2" && subject.name !== "subject1") {
            notRemoved.push(subject);
        }
    });

    var newBody = {
        schoolCode: 'pbcf65',
        school: 'PBCF',
        subjectList: notRemoved
    }
    
    var newOpts = {
        'headers': {
            'x-apikey': '6724f5d80ea5fabdcb0a8f84a6149003d6f51',
            'cache-control': 'no-cache',
            'content-type': 'application/json'
        },
        'body': JSON.stringify(newBody)
    };

    request.put('https://subjectselect-36c2.restdb.io/rest/schoolsubjects/' + id, newOpts, (err, rsp) => {
        console.log(rsp.statusCode);
    });
});