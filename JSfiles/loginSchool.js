global.$ = require('jquery');
const request = require('request');
const config = require('../config.json');
const schoolSubjectsKey = config.school_subjects_key;

// function that registers an event handler for school login.
function loginSchool() {
    // triggered when submit button is clicked
    $('#login').on('submit', (event) => {
        // prevent the event action
        event.preventDefault();
        event.stopPropagation();

        // get the school code from the DOM
        var schoolCode = $('#schoolcodeinput').val();

        schoolLoginSystem(schoolCode, (canLogin) => {
            if (canLogin) {
                // remove the event handler to allow the page to transition
                $("#login").unbind().submit();

                // display confirm message
                confirmMsg("Verification complete, please click Submit again to continue.");
            }
        });
    });
}

// the school's login system.
function schoolLoginSystem(schoolCode, cb) {
    // verify the school code.
    verifySchoolLogin(schoolCode, (verifiedSchool) => {
        /* 
           error messages will always be in type string, 
           so this condition is to separate it from the actual database data,
           which is of type object.
        */
        if (typeof verifiedSchool === "string") {
            // send the error msg to the screen
            errorMsg(verifiedSchool);

            // run the callback function with flag set to false to disallow the login.
            cb(false);

        } else {
            // grab the schoolCode from the database data.
            const DBschoolCode = verifiedSchool.schoolCode;

            // check if all the conditions are met.
            if (DBschoolCode === schoolCode) {
                cb(true)
            } else {
                // display an error message as it did not fit the conditions.
                errorMsg("Invalid School Code");

                // run the callback function with flag set to false to disallow the login.
                cb(false);
            }
        }
    });
}

// verify the school login.
function verifySchoolLogin(schoolCode, cb) {
    // check if school Code is null
    if (typeof schoolCode === "null") {
        cb("Invalid School Code.");
        return;
    }

    // REST database options.
    var opts = {
        'headers': {
          'cache-control': 'no-cache',
          'x-apikey': schoolSubjectsKey
        }
    }
    
    // Make a query to the school's database and return school's data.
    request.get(`https://subjectselect-36c2.restdb.io/rest/schoolsubjects?q={ "schoolCode": "${schoolCode}"}`, opts, (err, rsp, body) => {
        // extract the school's data from the raw result of the database.
        var data = JSON.parse(body)[0];

        if (!data) {
            // school's data does not match any of the records.
            cb("Invalid School Code");
        } else {
            // school's data is successful and is returned.
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

$(document).ready(loginSchool);
