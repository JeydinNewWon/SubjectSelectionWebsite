global.$ = require('jquery');
const request = require('request');
const config = require('../config.json');
const qs = require('query-string');
const availableSubjectsKey = config.available_subjects_key;
const schoolSubjectsKey = config.school_subjects_key;

var parsedData = qs.parse(window.location.search);
var schoolCode = parsedData.schoolCode;

// function that initialises the edit subjects page. Cb is callback function.
function init(cb) {

    // REST DB options to access the school subjects database.
    var schoolSubjectsOpts = {
        'headers': {
            'cache-control': 'no-cache',
            'x-apikey': schoolSubjectsKey
        }
    };

    // make a request to the school subjects database with the school code.
    request.get(`https://subjectselect-36c2.restdb.io/rest/schoolsubjects?q={"schoolCode": "${schoolCode}"}`, schoolSubjectsOpts, (err, rsp, schoolSubjectsBody) => {

        // REST DB options to access the available subject database.
        var availableSubjectsOpts = {
            'headers': {
                'cache-control': 'no-cache',
                'x-apikey': availableSubjectsKey
            }
        };

        // make a request to the available subject database with the schoool code
        request.get(`https://subjectselect-36c2.restdb.io/rest/availablesubjects?q={"schoolCode": "${schoolCode}"}`, availableSubjectsOpts, (err, rsp, availableSubjectsBody) => {
            // remove the loading icon.
            $("#loadingIcon").remove();

            // after the total units message, create the subject list.
            $('#helpMsg').after('<form class="subjectlist"> <input id="submit" type="submit" value="Submit"> </form>');

            // get school subject data list.
            var schoolSubjectData = JSON.parse(schoolSubjectsBody)[0].subjectList;
            // get available subject data list.
            var availableSubjectsData = JSON.parse(availableSubjectsBody)[0].subjectList;

            // reverse two lists.
            schoolSubjectData.reverse();
            availableSubjectsData.reverse();

            var counter = 1;

            schoolSubjectData.forEach((schoolSubject) => {
                // foreach subject, get the school subject name, units and colour.
                var name = schoolSubject.name;
                var units = schoolSubject.units
                var colour = schoolSubject.colour;

                // html for the input tag.
                var inputHTML = '<input type="checkbox" class="checker">';

                // select the subject list and prepend the subjet
                $(".subjectlist").prepend(`<div class="subject"> <p class="subjectname"> ${name} </p> <p> Units: ${units} </p> <label class="container"> ${inputHTML} <span class="checkmark"> </span> </label> </div> `);
                // since we are prepending, select the top subject and colour it.
                $(`.subject:nth-of-type(${counter})`).css('background', colour);
            });

            // register events for updateAvailablesubjects
            updateAvailableSubjects();
            // run the callback function with schoolsubjectdata and availablesubjectdata as parameters.
            cb(schoolSubjectData, availableSubjectsData);
        });


    });
}

// update available subjects
function updateAvailableSubjects(cb) {
    // triggered when subject list is submitted.
    $('.subjectlist').submit((event) => {
        // prevent the event from firing.
        event.preventDefault();
        // added subjects list.
        var addedSubjects = [];
        // selected the all checked elements.
        $(':checked').each((index, element) => {

            // get the parents then the siblings of the check box
            var siblings = $(element).parent().siblings();

            // get the subject name and its content
            var subjectName = siblings[0].textContent;

            // remove the spaces at the end.
            subjectName = subjectName.slice(1, subjectName.length-1);
            // get the units of the subject.
            var units = parseInt(siblings[1].textContent.replace('Units: ', ''));
            // get the colour of the subject.
            var colour = $(element).parent().parent().css("background").replace(' none repeat scroll 0% 0% / auto padding-box border-box', '');

            // create a subject model.
            var subject = {
                "name": subjectName,
                "units": units,
                "colour": colour
            };

            // add the subject to the addedSubjects list.
            addedSubjects.push(subject);
        });

        // REST DB GET Options.
        var getOpts = {
            'headers': {
                'cache-control': 'no-cache',
                'x-apikey': availableSubjectsKey
            }
        };


        // query available subjects database and 
        request.get(`https://subjectselect-36c2.restdb.io/rest/availablesubjects?q={"schoolCode": "${schoolCode}"}`, getOpts, (err, rsp, body) => {
            // model for availableSubjects.
            var availableSubjects = {
                "schoolCode": schoolCode,
                "subjectList": addedSubjects
            };

            // PUT DB options 
            var putOpts ={
                'headers': {
                    'x-apikey': availableSubjectsKey,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                'body': JSON.stringify(availableSubjects)
            };

            // get the id of the document to update
            var id = JSON.parse(body)[0]._id;

            // update the document of available subjects with the matching id
            request.put(`https://subjectselect-36c2.restdb.io/rest/availablesubjects/${id}`, putOpts, (err, rsp) => {
                // if successful,
                if (rsp.statusCode === 201 || rsp.statusCode === 200) {
                    // send a confirm message.
                    confirmMsg("Updated Subjects.");
                }
            })
        });
    });
}

function addSubject() {
    // triggered when the green 'Add' button is clicked.
    $('#addbutton').click((event) => {
        // get the newSubject name, units and colour.
        var newSubjectName = $("#newsubjectname").val();
        var newSubjectUnits = parseInt($("#newsubjectunits").val());
        var newSubjectColour = $("#newsubjectcolour").val();

        // if newSubjectname is empty,
        if (typeof newSubjectName === "null") {
            // send an error message.
            errorMsg("Invalid subject name.");
            return;
        }

        // if newSubjectunits is empty,
        if (typeof newSubjectUnits === "null") {
            // send an error message.
            errorMsg("Invalid subject units.");
            return;
        }

        // if newSubjectcolour is not rgb() or a hexadecimal,
        if (!(newSubjectColour.startsWith("rgb(")) && !(newSubjectColour.startsWith("#"))) {
            // send an error message.
            errorMsg("Invalid colour.");
            return;
        }

        // REST DB GET options.
        var getOpts = {
            'headers': {
                'cache-control': 'no-cache',
                'x-apikey': schoolSubjectsKey
            }
        }

        // get the school subjects with the schoolCode.
        request.get(`https://subjectselect-36c2.restdb.io/rest/schoolsubjects?q={"schoolCode": "${schoolCode}"}`, getOpts, (err, rsp, schoolData) => {
            // set a flag for can continue
            var canContinue = true;
            // get the school subject data
            var schoolSubjectData = JSON.parse(schoolData)[0];
            // get the subject list.
            var subjectList = schoolSubjectData.subjectList;
            // get the id of the school subject document.
            var id = schoolSubjectData._id;

            // for each subject in the subject list,
            subjectList.forEach((schoolSubject) => {
                // if the subject name equals new subject name
                if (schoolSubject.name === newSubjectName) {
                    // send an error message.
                    errorMsg("That subject has already been added");
                    // set canContinue flag false.
                    canContinue = false;
                    return;
                }
            });

            // if canContinue flag is true,
            if (canContinue) {

                // construct new subject model.
                var newSubject = {
                    "name": newSubjectName,
                    "units": newSubjectUnits,
                    "colour": newSubjectColour
                };

                // push the newsubject to the subject list.
                subjectList.push(newSubject);

                // create a model for the new school subject data.
                var newSubjectData = {
                    "schoolCode": schoolCode,
                    "subjectList": subjectList
                };

                // PUT REST DB options
                var putOpts = {
                    'headers': {
                        'x-apikey': schoolSubjectsKey,
                        'cache-control': 'no-cache',
                        'content-type': 'application/json'
                    },
                    'body': JSON.stringify(newSubjectData)
                };

                // update the existing schoolsubjects document with the matching id.
                request.put(`https://subjectselect-36c2.restdb.io/rest/schoolsubjects/${id}`, putOpts, (err, rsp) => {
                    // if it is successful,
                    if (rsp.statusCode === 201 || rsp.statusCode === 200) {
                        // prepend new subject to the subject list.
                        $(".subjectlist").prepend(`<div class="subject"> <p class="subjectname"> ${newSubjectName} </p> <p> Units: ${newSubjectUnits} </p> <label class="container"> <input type=checkbox class=checker checked> <span class="checkmark"> </span> </label> </div> `);
                        // select the first subject since we are prepending and add its new colour.
                        $(`.subject:nth-of-type(1)`).css('background', newSubjectColour);
                        // send a confirm message to the screen.
                        confirmMsg("Please press submit to confirm the new subject.");
                    }
                });
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
    // the callback function is run after editSubjects has initialised.
    init((schoolSubjectData, availableSubjectsData ) => {
        // create the difference array.
        var difference = [];
        // loop through schoolsubjectdata.
        schoolSubjectData.forEach((schoolSubject) => {
            // loop through availablesubjectdata.
            availableSubjectsData.forEach((availableSubject) => {
                // if the schoolsubject is currently available for selection,
                if (schoolSubject.name === availableSubject.name) {
                    // add it to the difference list.
                    difference.push(availableSubject);
                }
            });
        });


        // for each subject that is available,
        difference.forEach((checkedSubject) => {
            // select the subjects class
             $('.subject').each((index, element) => {
                 // loop through all the subjects
                 // get the subject text.
                 var subjectText = $(element).children('.subjectname').text();

                 // if the checkedSubject matches the subject in the DOM we are looping through,
                 if (checkedSubject.name === subjectText.slice(1, subjectText.length-1)) {
                     // set its checkmark to true as it is available for students to select.
                     $(element).children('.container').children(".checker").attr("checked", true);
                 }
             });
        });
    });
    // register the add subject events.
    addSubject();
}

$(document).ready(all);