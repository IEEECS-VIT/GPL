/**
 * Created by Kashish Singhal<singhal2.kashish@gmail.com> on 1/7/14.
 */

var email_settings = require('./email-settings');
var email_manager = {};
module.exports = email_manager;

email_manager.server = require("emailjs/email").server.connect({

    host: email_settings.host,
    user: email_settings.user,
    password: email_settings.password,
    ssl: true

});

email_manager.dispatchResetPasswordLink = function (account, callback) {
    email_manager.server.send({
        from: email_settings.sender,
        to: account.email,
        subject: 'Password Reset',
        text: 'something went wrong... :(',
        attachment: email_manager.composeEmail(account)
    }, callback);
}

email_manager.composeEmail = function (object) {
    var link = 'http://gravitaspremierleague.com/reset?e=' + object.email + '&p=' + object.pass;
    var html = "<html><body>";
    html += "Hi " + object.name + ",<br><br>";
    html += "Your username is :: <b>" + object.user + "</b><br><br>";
    html += "<a href='" + link + "'>Please click here to reset your password</a><br><br>";
    html += "Cheers,<br>";
    html += "</body></html>";
    return [
        {data: html, alternative: true}
    ];
}
