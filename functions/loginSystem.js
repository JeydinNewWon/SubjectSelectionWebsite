global.$ = require('jquery');
var verifyStudentLogin = require('./verifyStudentLogin.js');
var errorMsg = require('./errorMsg.js');

// loginSystem can have two modes for school and student logins. 
// CB is callback function

// studentEmail can be null.
function loginSystem(schoolCode, studentEmail=null, password=null, school=null, cb) {
    // if the schoolCode is 0, switch to student mode.
    if (schoolCode !== 0) {

    } else {
        verifyStudentLogin(studentEmail, password, school, (verifiedStudent) => {
            if (typeof verifiedStudent === String) {
                // display an error message on the screen to alert the user.
                errorMsg(verifiedStudent);

                // run the callback function with flag set to false to disallow the login.
                cb(false);

            } else {

                // grab the email data from the database
                const DBEmail = verifiedStudent["email"];

                // grab the password data from the database
                const DBPassword = verifiedStudent["password"];

                // grab the school associated with the student from the database
                const DBSchool = verifiedStudent["school"];

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

}

module.exports = {
    "loginSystem": loginSystem
};