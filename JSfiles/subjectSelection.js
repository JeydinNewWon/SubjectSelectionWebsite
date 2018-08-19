global.$ = require('jquery');
const request = require('request');
const config = require('../config.json');
const studentSelectionKey = config.student_subject_selection_key;
const availableSubjectsKey = config.available_subjects_key;
const qs = require('query-string');

// get the email from the query string in the URL.
var parsedData = qs.parse(window.location.search);
var email = parsedData.email;

// initialise the web page.
function init() {
    // REST DB GET options.
    var opts = {
        'headers': {
            'cache-control': 'no-cache',
            'x-apikey': studentSelectionKey
        }
    };

    // get the first and last name from the email input. Get rid of the email and split it by the dot to separate the name.
    var firstAndLastName = email.replace("@sydstu.catholic.edu.au", "").split('.');
    var firstName = firstAndLastName[0];
    var lastName = firstAndLastName[1];

    // insert the first and last name onto top right corner of page.
    $('header a').after(`<p id="studentname">${lastName.toUpperCase() + ', ' + firstName[0]  + firstName.slice(1, firstName.length)}</p>`)
    
    // query the database get the student's chosen subjects.
    request.get(`https://subjectselect-36c2.restdb.io/rest/studentsubjectselection?q={"email": "${email}"}`, opts, (err, rsp, body) => {
        var data = JSON.parse(body)[0];

        // if student has not chosen,
        if (!data) {
            // display the subjects available so that they can choose.
            displayAvailableSubjects(); 
        } else {
            // otherwise, load display the student's selected subjects.
            displayStudentSubjects(data);
        }

    });
}

// this function is run if student has NOT chosen their subjects already.
function displayAvailableSubjects() {
    // remove the loading icon from the DOM in prepartion for the subject list.
    $("#loadingIcon").remove();

    // create the subject list after the heading.
    $('#loginHeading').after('<form class="subjectlist"> <input id="submit" type="submit" value="Submit"> </form>');

    // REST DB options to get the available subjects.
    var opts = {
        'headers': {
            'cache-control': 'no-cache',
            'x-apikey': availableSubjectsKey
        }
    };

    // query the database and get the available subjects.
    request.get(`https://subjectselect-36c2.restdb.io/rest/availablesubjects?q={"schoolCode": "pbcf65" }`, opts, (err, rsp, body) => {
        // extract the list from the body.
        var subjectList = JSON.parse(body)[0].subjectList;

        /* 
        reverse the list as the application will prepend, 
        not append to make sure the submit button
        stays at the bottom of the screen.
        */
        subjectList.reverse();

        // loop through the subjectList
        subjectList.forEach((subject) => {
            // for each subject, get its name, units and colour.
            var name = subject.name;
            var units = subject.units;
            var colour = subject.colour;
            
            // add the subject to the subjectlist with its details.
            $(".subjectlist").prepend(`<div class="subject"> <p> ${name} </p> <p> Units: ${units} </p> <label class="container"> <input type="checkbox" class="checker"> <span class="checkmark"> </span> </label> </div> `);

            // select the newly added subject and add in its colour.
            $(`.subject:nth-of-type(1)`).css('background', colour);
        });

        // register the events for the subjectList once it has loaded.
        subjectSelectionSystem();
        // register the events for the checker system so that it can count total units when a checkbox is clicked.
        totalUnitsCounter();
    });

    // after the loginHeading, add the totalUnits counter.
    $('#loginHeading').after('<p id="totalUnits">Total Units: 0</p>');

}

// this function is run if the student already chose their subjects.
function displayStudentSubjects(data) {
    // remove the loading icon from the DOM in prepartion for the subject list.
    $('#loadingIcon').remove();

    // extract student's chosen subjects list from the database data.
    var chosenSubjects = data.chosenSubjects;

    // change the heading to 'Your Subjects'.
    $('#loginHeading').text('Your Subjects');

    // create a table after the heading to display the chosen subjects.
    $('#loginHeading').after('<table class="chosensubjects"> <tr> <th>Subject</th> <th>Units</th> </tr> </table>');

    // a counter for the total units.
    var totalUnits = 0;

    // loop through all the chosen subjects.
    chosenSubjects.forEach((subject) => {
        // for each subject, get its name and its units.
        var name = subject.name;
        var units = subject.units;

        // append the subject details to the table.
        $('.chosensubjects').append(`<tr> <td> ${name} </td> <td> ${units} </td> </tr>`);

        // add to the subject's units to the totalUnits.
        totalUnits += units;
    });

    // append a the final row to display the total units.
    $('.chosensubjects').append(`<tr> <td style="border-width: 0px !important"></td> <td> <b> Total: ${totalUnits} </b> </td> </tr>`);
}

// the funtion that is called if the submit button is pressed.
function subjectSelectionSystem() {
    // event triggered when the subjectlist form is submitted.
    $('.subjectlist').submit((event) => {
        // prevent the event action.
        event.preventDefault();
        
        // initiate a variable for a list of chosenSubjects.
        var chosenSubjects = [];

        // counter for totalUnits to check if the total units are not 13 or 14.
        var totalUnits = 0;
        
        // get all the subjects that are checked.
        $(':checked').each((index, element) => {
            // get the parent of the checkbox, then parent's the siblings to extract the subject name and the units count.
            var siblings = $(element).parent().siblings();
            
            // get the subject name.
            var subjectName = siblings[0].textContent;

            // get the subject units and parse it into an integer.
            var units = parseInt(siblings[1].textContent.replace('Units: ', ''));
            
            // create a subject model.
            var subject = {
                "name": subjectName,
                "units": units,
            }

            // add the subjecct units to total units.
            totalUnits += units;

            // append the subject model to the list of chosen subjects.
            chosenSubjects.push(subject);
        });

        // if the totalunits is greater than 14 or less than 13, it is invalid and cancel adding the subjects.
        if (totalUnits > 14 || totalUnits < 13) {
            // send an error message to the screen.
            errorMsg("Your total units must 13 or 14.");
        } else {
            // convert all the student's subject data into a model, with the email as an identifier.
            var studentSubjectData = {
                "email": email,
                "chosenSubjects": chosenSubjects
            };

            // POST options for the student's chosen subject database.
            var opts = {
                'headers': {
                    'x-apikey': studentSelectionKey,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                'body': JSON.stringify(studentSubjectData)
            };

            // POST the student's subjectData to the database.
            request.post("https://subjectselect-36c2.restdb.io/rest/studentsubjectselection", opts, (err, rsp) => {
                if (err || rsp.statusCode === 400) {
                    // if there is an error or status code is 400, display an error message.
                    errorMsg("Sorry, there was an error with the Database.");
                } else {
                    // confirm message that the student's subjects have been selected.
                    confirmMsg("Your subjects have been selected.");
                }           
            });
        }
    });
}

// used to count the total Units every time checkbox is clicked.
function totalUnitsCounter() {
    // triggered when a checkbox is clicked.
    $('.checker').change((event) => {
        // get the current totalUnits.
        var totalUnits = parseInt($('#totalUnits').text().replace("Total Units: ", ""));

        // get the units of the subject that is being clicked.
        var units = parseInt($(event.currentTarget).parent().siblings()[1].textContent.replace("Units: ", ""));

        // if the checkbox is checked,
        if ($(event.currentTarget).is(':checked')) {
            // add the units.
            totalUnits += units;
        } else {
            // otherwise, subtract the units.
            totalUnits -= units;
        }

        // update the current total units.
        $("#totalUnits").text(`Total Units: ${totalUnits}`);
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

function all() {
    init();
}

// load all functions.
$(document).ready(all);