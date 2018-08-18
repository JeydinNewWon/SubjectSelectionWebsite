const request = require('request');
const config = require('../config.json');
const studentSelectionKey = config.db_key;

var data = {
    schoolCode: 'pbcf65',
    school: 'PBCF',
    subjectList: [
        {
            "name": "Mathematics Advanced",
            "units": 2,
            "colour": "#f47b53",
            "prereq": "B in Mathematics 5.2/5.3"
        },
        {
            "name": "Mathematics Standard 1 and 2",
            "units": 2,
            "colour": "#f25a52",
            "prereq": null 
        },
        {
            "name": "Mathematics Extension 1",
            "units": 1,
            "colour": "#f2b15c",
            "prereq": "A in Mathematics 5.3"
        },
        {
            "name": "English Standard 1 and 2",
            "units": 2,
            "colour": "#80c17a",
            "prereq": null
        },
        {
            "name": "English Advanced",
            "units": 2,
            "colour": "#68db5e",
            "prereq": "B in English"
        },
        {
            "name": "English Extension 1",
            "units": 1,
            "colour": "#5edb8b",
            "prereq": "Top 10% of grade in English"
        },
        {
            "name": "Physics",
            "units": 2,
            "colour": "#eded55",
            "prereq": "B in Science, A in 5.3 Mathematics"
        },
        {
            "name": "Chemistry",
            "units": 2,
            "colour": "#74defc",
            "prereq": "B in Science"
        },
        {
            "name": "Biology",
            "units": 2,
            "colour": "#4fa85e",
            "prereq": "C in Science"
        },
        {
            "name": "Earth and Environmental Science",
            "units": 2,
            "colour": "#e59432",
            "prereq": "C in Science"
        },
        {
            "name": "Investigating Science",
            "units": 2,
            "colour": "#e362ef",
            "prereq": null
        },
        {
            "name": "Studies of Religion 1",
            "units": 1,
            "colour": "#f7f977",
            "prereq": "C in English"
        },
        {
            "name": "Studies of Religion 2",
            "units": 2,
            "colour": "#e2c72d",
            "prereq": "C in English"
        },
        {
            "name": "Business Studies",
            "units": 2,
            "colour": "#bc8d5e",
            "prereq": null
        },
        {
            "name": "Software Design and Development",
            "units": 2,
            "colour": "#970be8",
            "prereq": "C in Maths"
        }
    ]
};

var opts = {
    'headers': {
        'cache-control': 'no-cache',
        'x-apikey': studentSelectionKey,
    }
}

request.get('https://subjectselect-36c2.restdb.io/rest/schoolsubjects', opts, (err, rsp, body)  => {
    console.log(body);
});
