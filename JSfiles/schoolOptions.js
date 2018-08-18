global.$ = require('jquery');
const qs = require('query-string');

var parsedData = qs.parse(window.location.search);
var schoolCode = parsedData.schoolCode;

function init() {
    $("a[href='editSubjects.html']").attr('href', `editSubjects.html?schoolCode=${schoolCode}`);
}

$(document).ready(init);