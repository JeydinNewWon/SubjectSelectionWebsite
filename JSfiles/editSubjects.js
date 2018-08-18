global.$ = require('jquery');
const request = require('request');
const config = require('../config.json');
const qs = require('query-string');
const availableSubjectsKey = config.available_subjects_key;
const schoolSubjectsKey = config.school_subjects_key;

var parsedData = qs.parse(window.location.search);
var schoolCode = parsedData.schoolCode;

function init(cb) {

    console.log(schoolCode);
    var schoolSubjectsOpts = {
        'headers': {
            'cache-control': 'no-cache',
            'x-apikey': schoolSubjectsKey
        }
    }
    request.get(`https://subjectselect-36c2.restdb.io/rest/schoolsubjects?q={"schoolCode": "${schoolCode}"}`, schoolSubjectsOpts, (err, rsp, schoolSubjectsBody) => {

        var availableSubjectsOpts = {
            'headers': {
                'cache-control': 'no-cache',
                'x-apikey': availableSubjectsKey
            }
        };

        request.get(`https://subjectselect-36c2.restdb.io/rest/availablesubjects?q={"schoolCode": "${schoolCode}"}`, availableSubjectsOpts, (err, rsp, availableSubjectsBody) => {
            $("#loadingIcon").remove();
            $('#addsubjectwrapper').after('<form class="subjectlist"> <input id="submit" type="submit" value="Submit"> </form>');
            var schoolSubjectData = JSON.parse(schoolSubjectsBody)[0].subjectList;
            var availableSubjectsData = JSON.parse(availableSubjectsBody)[0].subjectList;

            schoolSubjectData.reverse();
            availableSubjectsData.reverse();

            var counter = 1;

            schoolSubjectData.forEach((schoolSubject) => {
                var name = schoolSubject.name;
                var units = schoolSubject.units
                var colour = schoolSubject.colour;

                var inputHTML = '<input type="checkbox" class="checker">';

                $(".subjectlist").prepend(`<div class="subject"> <p class="subjectname"> ${name} </p> <p> Units: ${units} </p> <label class="container"> ${inputHTML} <span class="checkmark"> </span> </label> </div> `);
                $(`.subject:nth-of-type(${counter})`).css('background', colour);
            });

            updateAvailableSubjects();
            cb(schoolSubjectData, availableSubjectsData);
        });


    });
}

function updateAvailableSubjects(cb) {
    $('.subjectlist').submit((event) => {
        event.preventDefault();
        var addedSubjects = [];
        $(':checked').each((x, element) => {
            var siblings = $(element).parent().siblings();

            var subjectName = siblings[0].textContent;
            subjectName = subjectName.slice(1, subjectName.length-1);
            var units = parseInt(siblings[1].textContent.replace('Units: ', ''));
            var colour = $(element).parent().parent().css("background").replace(' none repeat scroll 0% 0% / auto padding-box border-box', '');

            var subject = {
                "name": subjectName,
                "units": units,
                "colour": colour
            };

            addedSubjects.push(subject);
        });

        var getOpts = {
            'headers': {
                'cache-control': 'no-cache',
                'x-apikey': availableSubjectsKey
            }
        };


        request.get(`https://subjectselect-36c2.restdb.io/rest/availablesubjects?q={"schoolCode": "${schoolCode}"}`, getOpts, (err, rsp, body) => {
            var availableSubjects = {
                "schoolCode": schoolCode,
                "subjectList": addedSubjects
            };

            var putOpts ={
                'headers': {
                    'x-apikey': availableSubjectsKey,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                'body': JSON.stringify(availableSubjects)
            };

            var id = JSON.parse(body)[0]._id;

            request.put(`https://subjectselect-36c2.restdb.io/rest/availablesubjects/${id}`, putOpts, (err, rsp) => {
                if (rsp.statusCode === 201 || rsp.statusCode === 200) {
                    confirmMsg("Updated Subjects.");
                }
            })
        });
    });
}

function addSubject() {
    $('#addbutton').click((event) => {
        var newSubjectName = $("#newsubjectname").val();
        var newSubjectUnits = parseInt($("#newsubjectunits").val());
        var newSubjectColour = $("#newsubjectcolour").val();

        if (typeof newSubjectName === "null") {
            errorMsg("Invalid subject name.");
            return;
        }

        if (typeof newSubjectUnits === "null") {
            errorMsg("Invalid subject units.");
            return;
        }

        if (!(newSubjectColour.startsWith("rgb(")) && !(newSubjectColour.startsWith("#"))) {
            errorMsg("Invalid colour.");
            return;
        }

        var getOpts = {
            'headers': {
                'cache-control': 'no-cache',
                'x-apikey': schoolSubjectsKey
            }
        }

        request.get(`https://subjectselect-36c2.restdb.io/rest/schoolsubjects?q={"schoolCode": "${schoolCode}"}`, getOpts, (err, rsp, schoolData) => {
            var canContinue = true;
            var schoolSubjectData = JSON.parse(schoolData)[0];
            var subjectList = schoolSubjectData.subjectList;
            var id = schoolSubjectData._id;

            subjectList.forEach((schoolSubject) => {
                if (schoolSubject.name === newSubjectName) {
                    errorMsg("That subject has already been added");
                    canContinue = false;
                    return;
                }
            });

            if (canContinue) {

                var newSubject = {
                    "name": newSubjectName,
                    "units": newSubjectUnits,
                    "colour": newSubjectColour
                };

                subjectList.push(newSubject);

                var newSubjectData = {
                    "schoolCode": schoolCode,
                    "subjectList": subjectList
                };

                var putOpts = {
                    'headers': {
                        'x-apikey': schoolSubjectsKey,
                        'cache-control': 'no-cache',
                        'content-type': 'application/json'
                    },
                    'body': JSON.stringify(newSubjectData)
                };

                request.put(`https://subjectselect-36c2.restdb.io/rest/schoolsubjects/${id}`, putOpts, (err, rsp) => {
                    if (rsp.statusCode === 201 || rsp.statusCode === 200) {
                        $(".subjectlist").prepend(`<div class="subject"> <p class="subjectname"> ${newSubjectName} </p> <p> Units: ${newSubjectUnits} </p> <label class="container"> <input type=checkbox class=checker checked> <span class="checkmark"> </span> </label> </div> `);
                        $(`.subject:nth-of-type(1)`).css('background', newSubjectColour);
                        confirmMsg("Please press submit to confirm the new subject.");
                    }
                })
            }
        });
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
    init((schoolSubjectData, availableSubjectsData ) => {
        var difference = [];
        schoolSubjectData.forEach((schoolSubject) => {
            availableSubjectsData.forEach((availableSubject) => {
                if (schoolSubject.name === availableSubject.name) {
                    difference.push(availableSubject);
                }
            });
        });

        difference.forEach((checkedSubject) => {
             $('.subject').each((x, element) => {
                 var subjectText = $(element).children('.subjectname').text();
                 if (checkedSubject.name === subjectText.slice(1, subjectText.length-1)) {
                     $(element).children('.container').children(".checker").attr("checked", true);
                 }
             });
        });
    });
    addSubject();
}

$(document).ready(all);