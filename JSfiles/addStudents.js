global.$ = require('jquery');
const request = require('request');
const config = require('../config.json');
const studentLoginKey = config.student_login_key;

function addStudent() {
    $("#addstudent").on('submit', (event) => {
        event.preventDefault();

        var email = $('#emailinput').val();
        var password = $('#passwordinput').val();

        verifyDetails(email, password, (msg, success) => {
            if (!success) {
                errorMsg(msg);
            } else {
                confirmMsg(msg);
            }
        });
    });
}

function verifyDetails(email, password, cb) {
    if (!(email.endsWith("sydstu.catholic.edu.au"))) {
        cb("Email must end with \"@sydstu.catholic.edu.au\".", false);
        return;
    }

    if (typeof password === "null") {
        cb("Invalid password", false);
        return;
    }

    var getOpts = {
        'headers': {
            'cache-control': 'no-cache',
            'x-apikey': studentLoginKey
        }
    }
    
    request.get(`https://subjectselect-36c2.restdb.io/rest/studentlogin?q={ "email": "${email}"}`, getOpts, (err, rsp, body) => {
        var data = JSON.parse(body)[0];

        if (data) {
            cb("Student already registered.", false);
        } else {
            var newStudent = {
                "email": email,
                "password": password,
                "school": "PBCF"
            };

            var postOpts = {
                'headers': {
                    'cache-control': 'no-cache',
                    'x-apikey': studentLoginKey,
                    'content-type': 'application/json'
                },
                'body': JSON.stringify(newStudent)
            };

            request.post(`https://subjectselect-36c2.restdb.io/rest/studentlogin`, postOpts, (err, rsp) => {
                if (rsp.statusCode === 201 || rsp.statusCode === 200) {
                    cb("Successfully added student.", true);
                }
            });
        }
    });
}

// display the confirm message.
function confirmMsg(confirmMsg) {
    // check if error message exists.
    if ($('#errormsg').length)
        // remove error message if it exists.
        $('#errormsg').remove();

    // check if confirm message exists
    if (!$("#confirmmsg").length) {
        // if it does not exist, add a confirm message after the heading.
        $('#loginHeading').after('<p id="confirmmsg">' + confirmMsg + '</p>');
    } else {
        // replace the current confirm message with a new message.
        $("#confirmmsg").text(confirmMsg);
    }
}

// display the error message.
function errorMsg(errorMsg) {
    // check if confirm message exists.
    if ($('#confirmmsg').length)
        // remove confirm message if it exists.
        $('#confirmmsg').remove();

    // check if error message exists.
    if (!$("#errormsg").length) {
        // if it does not exist, add an error message after the heading.
        $('#loginHeading').after('<p id="errormsg">' + errorMsg + '</p>');
    } else {
        // replace the current error message with a new message.
        $("#errormsg").text(errorMsg);
    }
}

$(document).ready(addStudent);
