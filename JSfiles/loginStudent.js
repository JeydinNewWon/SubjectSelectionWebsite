global.$ = require('jquery');
const request = require('request');
const config = require('../config.json');
const studentLoginKey = config.student_login_key;

function login() {
    // activates when the login form is submitted
    $('#login').on('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        // make the mouse have a loading icon when the system attempts to login.
        $('*').hover(() => {
            $(this).css('cursor', 'wait');
        });

        // grab the student email input from the DOM.
        var studentEmail = $('#emailinput').val();

        // grab the password input from the DOM.
        var password = $('#passwordinput').val();

        // grab the school from the DOM.
        var school = $('#selector').val();

        studentLoginSystem(studentEmail, password, school, (canLogin) => {
            if (canLogin) {
                $('#login').unbind().submit();
                confirmMsg("Verification complete, please click Submit again to continue.");
            }
        });
    });
}

function studentLoginSystem(studentEmail, password, school, cb) {
    verifyStudentLogin(studentEmail, password, school, (verifiedStudent) => {
        if (typeof verifiedStudent === "string") {
            // display an error message on the screen to alert the user.
            errorMsg(verifiedStudent);

            // run the callback function with flag set to false to disallow the login.
            cb(false);

        } else {

            // grab the email data from the database
            const DBEmail = verifiedStudent.email;

            // grab the password data from the database
            const DBPassword = verifiedStudent.password;

            // grab the school associated with the student from the database
            const DBSchool = verifiedStudent.school;

            // check if all the conditions are met.
            if (DBEmail === studentEmail && DBPassword == password && DBSchool == school) {
                // run the callback function with flag set to true to allow the login.
                cb(true);
            } else {
                // display an error message on the screen to alert the user.
                errorMsg("Invalid Login Details.");

                // run the callback function with flag set to false to disallow the login.
                cb(false);
            }
        }

    });
}

// verify the student's Login with studentEmail, password and school. Cb is callback function.
function verifyStudentLogin(studentEmail, password, school, cb) {

    // Email is only valid if it ends with sydstu.catholic.edu.au
    if (!(studentEmail.endsWith("sydstu.catholic.edu.au"))) {
        cb("Invalid email.");
        return;
    }

    // Check if password is empty
    if (typeof password === "null") {
        cb("Invalid password.");
        return;
    }

    // Check if schoolName is empty
    if (typeof school === "null") {
        cb("Invalid school.");
        return;
    }

    // Database REST options
    var opts = {
        'headers': {
          'cache-control': 'no-cache',
          'x-apikey': studentLoginKey
        }
    }

    // Make a query to the database, and return student's Data.
    request.get(`https://subjectselect-36c2.restdb.io/rest/studentlogin?q={"email": "${studentEmail}", "password": "${password}", "school": "${school}"}`, opts, (err, rsp, body) => {
        // extract student data from raw database data.
        var data = JSON.parse(body)[0];

        if (!data) {
            // Student does not match any of the records.
            cb("Invalid Student Details");
        } else {
            // Student data is successful and is returned.
            cb(data);
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

$(document).ready(login);


