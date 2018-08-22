global.$ = require('jquery');
const qs = require('query-string');

// get the query string from the URL.
var parsedData = qs.parse(window.location.search);
var schoolCode = parsedData.schoolCode;

// called when the html is initialised.
function init() {
    // edit the button that leads to editSubjects.html, and set it for a query string with a schoolCode.
    $("a[href='editSubjects.html']").attr('href', `editSubjects.html?schoolCode=${schoolCode}`);
}

$(document).ready(init);
