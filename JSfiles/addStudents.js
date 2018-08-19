global.$ = require('jquery');
const request = require('request');
const config = require('../config.json');
const studentLoginKey = config.student_login_key;

function addStudent() {
    // triggered when the addstudent button is clicked.
    $("#addstudent").on('submit', (event) => {
        // prevent the form from immediately submitting.
        event.preventDefault();

        // get the email input.
        var email = $('#emailinput').val();
        // get the password input.
        var password = $('#passwordinput').val();

        // call the verify details function.
        verifyDetails(email, password, (msg, success) => {
            // if the process failed,
            if (!success) {
                // send an error message.
                errorMsg(msg);
            } else {
                // otherwise, send a confirm message.
                confirmMsg(msg);
            }
        });
    });
}

// verifies the details
function verifyDetails(email, password, cb) {
    // if the email does not end with @sydstu.catholic.edu.au,
    if (!(email.endsWith("sydstu.catholic.edu.au"))) {
        // run the callback function with the error message and success set to false.
        cb("Email must end with \"@sydstu.catholic.edu.au\".", false);
        return;
    }

    // if password is null,
    if (typeof password === "null") {
        // run the callback function with the error message and success set to false.
        cb("Invalid password", false);
        return;
    }

    // GET options
    var getOpts = {
        'headers': {
            'cache-control': 'no-cache',
            'x-apikey': studentLoginKey
        }
    }
    
    // query the database with student Email
    request.get(`https://subjectselect-36c2.restdb.io/rest/studentlogin?q={ "email": "${email}"}`, getOpts, (err, rsp, body) => {
        // get the data from the database.
        var data = JSON.parse(body)[0];

        // if the student already exists,
        if (data) {
            // run the callback function with the error message and success set to false.
            cb("Student already registered.", false);
        } else {
            // construct a new student model.
            var newStudent = {
                "email": email,
                "password": password,
                "school": "PBCF"
            };

            // POST options.
            var postOpts = {
                'headers': {
                    'cache-control': 'no-cache',
                    'x-apikey': studentLoginKey,
                    'content-type': 'application/json'
                },
                'body': JSON.stringify(newStudent)
            };

            // add the new student to the student login database 
            request.post(`https://subjectselect-36c2.restdb.io/rest/studentlogin`, postOpts, (err, rsp) => {
                // if it is successful,
                if (rsp.statusCode === 201 || rsp.statusCode === 200) {
                    //r un the callback function with the a confirm message and success set to true.
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
