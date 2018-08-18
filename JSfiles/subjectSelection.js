global.$ = require('jquery');
const request = require('request');
const config = require('../config.json');
const studentSelectionKey = config.student_subject_selection_key;
const availableSubjectsKey = config.available_subjects_key;
const qs = require('query-string');

var parsedData = qs.parse(window.location.search);
var email = parsedData.email;

function init() {
    var opts = {
        'headers': {
            'cache-control': 'no-cache',
            'x-apikey': studentSelectionKey
        }
    }

    var firstAndLastName = email.replace("@sydstu.catholic.edu.au", "").split('.');
    $('header a').after(`<p id="studentname">${firstAndLastName[1].toUpperCase() + ', ' + firstAndLastName[0]}</p>`)
    
    request.get(`https://subjectselect-36c2.restdb.io/rest/studentsubjectselection?q={"email": "${email}"}`, opts, (err, rsp, body) => {
        var data = JSON.parse(body)[0];

        if (!data) {
            displayAvailableSubjects(); 
        } else {
            displayStudentSubjects(data);
        }

    });
}

function displayAvailableSubjects() {
    $("#loadingIcon").remove();
    $('#loginHeading').after('<form class="subjectlist"> <input id="submit" type="submit" value="Submit"> </form>');

    var opts = {
        'headers': {
            'cache-control': 'no-cache',
            'x-apikey': availableSubjectsKey
        }
    };

    request.get(`https://subjectselect-36c2.restdb.io/rest/availablesubjects?q={"schoolCode": "pbcf65" }`, opts, (err, rsp, body) => {
        var subjectList = JSON.parse(body)[0].subjectList;
        subjectList.reverse();

        var counter = 1

        subjectList.forEach((subject) => {
            var name = subject.name;
            var units = subject.units;
            var colour = subject.colour;
            
            $(".subjectlist").prepend(`<div class="subject"> <p> ${name} </p> <p> Units: ${units} </p> <label class="container"> <input type="checkbox" class="checker"> <span class="checkmark"> </span> </label> </div> `);
            $(`.subject:nth-of-type(${counter})`).css('background', colour);
        });

        subjectSelectionSystem();
        onCheck();
    });

    $('#loginHeading').after('<p id="totalUnits">Total Units: 0</p>');

}

function displayStudentSubjects(data) {
    $('#loadingIcon').remove();
    var chosenSubjects = data.chosenSubjects;

    $('#loginHeading').text('Your Subjects');
    $('#loginHeading').after('<table class="chosensubjects"> <tr> <th>Subject</th> <th>Units</th> </tr> </table>');

    var totalUnits = 0;
    chosenSubjects.forEach((subject) => {
        var name = subject.name;
        var units = subject.units;
        $('.chosensubjects').append(`<tr> <td> ${name} </td> <td> ${units} </td> </tr>`);
        totalUnits += units;
    });

    $('.chosensubjects').append(`<tr> <td style="border-width: 0px !important"></td> <td> <b> Total: ${totalUnits} </b> </td> </tr>`);
}

function subjectSelectionSystem() {
    $('.subjectlist').submit((event) => {
        event.preventDefault();
        var chosenSubjects = [];
        var totalUnits = 0;
        console.log($(':checked'));
        $(':checked').each((index, element) => {
            var siblings = $(element).parent().siblings();
            
            var subjectName = siblings[0].textContent;
            var units = parseInt(siblings[1].textContent.replace('Units: ', ''));
            
            var subject = {
                "name": subjectName,
                "units": units,
            }

            totalUnits += units;
            chosenSubjects.push(subject);
        });


        if (totalUnits > 14 || totalUnits < 13) {
            errorMsg("Your total units must 13 or 14.");
        } else {
            var studentSubjectData = {
                "email": email,
                "chosenSubjects": chosenSubjects
            };

            var opts = {
                'headers': {
                    'x-apikey': studentSelectionKey,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                'body': JSON.stringify(studentSubjectData)
            };

            request.post("https://subjectselect-36c2.restdb.io/rest/studentsubjectselection", opts, (err, rsp) => {
                if (err || rsp.statusCode === 400) {
                    errorMsg("Sorry, there was an error with the Database.");
                } else {
                    confirmMsg("Your subjects have been selected.");
                }           
            });
        }
    });
}

function onCheck() {
    $('.checker').change((event) => {
        var totalUnits = parseInt($('#totalUnits').text().replace("Total Units: ", ""));
        console.log(totalUnits)
        var units = parseInt($(event.currentTarget).parent().siblings()[1].textContent.replace("Units: ", ""));
        console.log(units);
        if ($(event.currentTarget).is(':checked')) {
            totalUnits += units;
        } else {
            totalUnits -= units;
        }

        $("#totalUnits").text(`Total Units: ${totalUnits}`);
    });
}

function confirmMsg(confirmMsg) {
    if ($('#errormsg').length)
        $('#errormsg').remove();

    if (!$("#confirmmsg").length) {
        $('#loginHeading').after('<p id="confirmmsg">' + confirmMsg + '</p>');
    } else {
        $("#confirmmsg").text(confirmMsg);
    }
}

function errorMsg(errorMsg) {
    if ($('#confirmmsg').length)
        $('#confirmmsg').remove();

    if (!$("#errormsg").length) {
        $('#loginHeading').after('<p id="errormsg">' + errorMsg + '</p>');
    } else {
        $("#errormsg").text(errorMsg);
    }
}

function all() {
    init();
}

$(document).ready(all);