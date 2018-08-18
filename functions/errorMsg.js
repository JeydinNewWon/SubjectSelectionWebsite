global.$ = require('require');

function errorMsg(errMsg) {
    if (!$("#errormsg").length) {
        $('#loginHeading').after('<p id="errormsg">' + errMsg + '</p>');
    } else {
        $("#errormsg").text(errMsg);
    }
}

module.exports = {
    "errorMsg": errorMsg
};

