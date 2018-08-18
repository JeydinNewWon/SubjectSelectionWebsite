const request = require('request');
const config = require('../config.json');
const DBKey = config.db_key;

// verify the student's Login with studentEmail, password and school. Cb is callback function.
function verifyStudentLogin(studentEmail, password, school, cb) {

    // Email is only valid if it ends with sydstu.catholic.edu.au
    if (!(studentEmail.endsWith("sydstu.catholic.edu.au"))) {
        cb("Invalid email.");
        return;
    }

    // Check if password is empty
    if (typeof password == null) {
        cb("Invalid password.");
        return;
    }

    // Check if schoolName is empty
    if (typeof school == null) {
        cb("Invalid school.");
        return;
    }

    // Database REST options
    var opts = {
        'headers': {
          'cache-control': 'no-cache',
          'x-apikey': DBKey
        }
    }


    // Make a query to the database, and return student's Data.
    request.get(`https://subjectselect-36c2.restdb.io/rest/studentlogin?q={"email": "${studentEmail}", "password": "${password}", "school": "${school}"}`, opts, (err, rsp, body) => {
        if (err || rsp.statusCode != 200 || rsp.statusCode != 201) {
            cb("ERROR WITH LOGIN DATABASE");
        }

        if (!body) {
            // Student does not match any of the records.
            cb("Invalid Student Details");
        } else {
            // Student data is successful and is returned.
            cb(body);
        }
    });
}

module.exports = {
    "verifyStudentLogin": verifyStudentLogin
};