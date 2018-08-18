const request = require('request');

var tempValue = {
    schoolCode: 'pbcf65',
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
        'x-apikey': '6724f5d80ea5fabdcb0a8f84a6149003d6f51',
        'cache-control': 'no-cache',
    }
}

var pushOpts = {
    'headers': {
        'x-apikey': '6724f5d80ea5fabdcb0a8f84a6149003d6f51',
        'cache-control': 'no-cache',
        'content-type': 'application/json'
    },
    'body': JSON.stringify(tempValue)
}

request.get('https://subjectselect-36c2.restdb.io/rest/availablesubjects?q={ "schoolCode": "pbcf65" }', opts, (err, rsp, body) => {
    var id = JSON.parse(body)[0]._id;
    console.log(body);

    request.put("https://subjectselect-36c2.restdb.io/rest/availablesubjects/" + id, pushOpts, (err, rsp) => {
        if (err)
            console.log(err);

        if (rsp)
            console.log(rsp.statusCode);
    });
});


