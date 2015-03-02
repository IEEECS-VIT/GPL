/**
 * Created by Kashish Singhal<singhal2.kashish@gmail.com> on 1/7/14.
 */
/*
 *  GraVITas Premier League
 *  Copyright (C) 2014  IEEE Computer Society - VIT Student Chapter <ieeecs@vit.ac.in>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
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

email_manager.dispatchResetPasswordLink = function (account, callback)
{
    email_manager.server.send({
                                  from: email_settings.sender,
                                  to: account.email,
                                  subject: 'Password Reset',
                                  text: 'something went wrong... :(',
                                  attachment: email_manager.composeEmail(account)
                              }, callback);
};

email_manager.composeEmail = function (object)
{
    var link = 'http://gravitaspremierleague.com/reset?e=' + object.email + '&p=' + object.pass;
    var html = "<html><body>";
    html += "Hi " + object.name + ",<br><br>";
    html += "You are seeing this message because somebody (most probably you) has chosen to reset the password for the Gravitas Premier League account associated with this email address.<br />";
    html += "Your username is : <b>" + object.user + "</b><br><br>";
    html += "Please click <a href='" + link + "'>here</a> to reset your password<br><br>";
    html += "Regards,<br>";
    html += "Team Gravitas Premier League</body></html>";
    return [
        {data: html, alternative: true}
    ];
};
