/*
 *  GraVITas Premier League <gravitaspremierleague@gmail.com>
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

var log;
var user;
var reset;
var token;
var bcrypt;
var register;
var interest;
var password;
var ref =
{
    'admin' :
    [
        'admin',
        '/admin'
    ],
    'local' :
    [
        'name',
        '/home'
    ]
};
var path = require('path');
var crypto = require('crypto');
var router = require('express').Router();
var email = require(path.join(__dirname, '..', 'worker', 'email'));
var record = require(path.join(__dirname, '..', 'db', 'mongo-record'));
var mongoTeam = require(path.join(__dirname, '..', 'db', 'mongo-team'));
var mongoUsers = require(path.join(__dirname, '..', 'db', 'mongo-users'));

register = interest = email.wrap({
    from: 'gravitaspremierleague@gmail.com',
    subject: 'Welcome to graVITas premier league 2.0!'
});

password = user = email.wrap({
    from: 'gravitaspremierleague@gmail.com',
    subject: 'Time to get back in the game'
});

reset = email.wrap({
    from: 'gravitaspremierleague@gmail.com',
    subject: 'Password change successful!'
});

interest.attach_alternative("<table background='http://res.cloudinary.com/gpl/general/img0.jpg' align='center' cellpadding='0' cellspacing='0' width='600' style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
    "<tr><td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>graVITas Premier League</td>" +
    "</tr><tr><td align='center' style='padding: 5px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:x-large;'> Thank you for your interest in graVITas Premier League <br>" +
    "Please check out  our Facebook <a href='http://www.facebook.com/gravitaspremierleague' style='text-decoration: none;'>page</a> to stay close to all the action! </td>" +
    "</tr><tr><td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; font-weight: bold;'>Regards,<br>Team GPL,<br>IEEE Computer Society<br>IEEE Computer Society<br>VIT student chapter</td></tr></table>");


register.attach_alternative("<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Strict//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'>" +
    "<html xmlns='http://www.w3.org/1999/xhtml' xmlns='http://www.w3.org/1999/xhtml'>" +
    "  <head>" +
    "    <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" +
    "    <meta name='viewport' content='width=device-width' />" +
    "  </head>" +
    "  <body style='width: 100% !important; min-width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; text-align: left; line-height: 19px; font-size: 14px; margin: 0; padding: 0;'>" +
    "    <table class='body' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; height: 100%; width: 100%; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td class='center' align='center' valign='top' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: center; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0;'>" +
    "        <center style='width: 100%; min-width: 580px;'>" +
    "          <table class='row header' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; position: relative; background: #0D5B67; padding: 0px;' bgcolor='#0D5B67'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td class='center' align='center' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: center; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0;' valign='top'>" +
    "                <center style='width: 100%; min-width: 580px;'>" +
    "                  <table class='container' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: inherit; width: 580px; margin: 0 auto; padding: 0;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td class='wrapper last' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 10px 0 0' align='left' valign='top'>" +
    "                        <table class='twelve columns' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 580px; margin: 0 auto; padding: 0;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td class='six sub-columns' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; min-width: 0; width: 50%; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0 10px 10px 0;' align='left' valign='top'>" +
    "                              <img src='http://res.cloudinary.com/gpl/general/gpllogo.png' height='50' style='outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; width: auto; max-width: 100%; float: left; clear: both; display: block;' align='left' /></td>" +
    "                            <td class='six sub-columns last' style='text-align: right; vertical-align: middle; word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; min-width: 0; width: 50%; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0px 0px 10px;' align='right' valign='middle'>" +
    "                              <span class='template-label' style='color: #ffffff; font-weight: bold; font-size: 11px;'>Gravitas Premier League</span>" +
    "                            </td>" +
    "                            <td class='expander' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; visibility: hidden; width: 0; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0;' align='left' valign='top'></td>" +
    "                          </tr></table></td>" +
    "                    </tr></table></center>" +
    "              </td>" +
    "            </tr></table><table class='container' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: inherit; width: 580px; margin: 0 auto; padding: 0;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0;' align='left' valign='top'>" +
    "                <table class='row' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; position: relative; display: block; padding: 0px;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td class='wrapper last' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 10px 0px 0px;' align='left' valign='top'>" +
    "                      <table class='twelve columns' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 580px; margin: 0 auto; padding: 0;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0px 0px 10px;' align='left' valign='top'>" +
    "                            <h1 style='color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; text-align: left; line-height: 1.3; word-break: normal; font-size: 40px; margin: 0; padding: 0;' align='left'>Hi,</h1>" + "                                        <p class='lead' style='color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; text-align: left; line-height: 21px; font-size: 18px; margin: 0 0 10px; padding: 0;' align='left'>This is to inform that that you have successfully registered for Gravitas Premier League 2.0." +
    "                          </p>" +
    "                          <p style='color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; text-align: left; line-height: 19px; font-size: 14px; margin: 0 0 10px; padding: 0;' align='left'><a href='http://gravitaspremierleague.com/' style='color: #2ba6cb; text-decoration: none;'>Click here</a> for more details. <br />" +
    "                          Good luck! <br /><br />" +
    "                          Regards<br />" +
    "                          Team GPL,<br />" +
    "                          IEEE Computer Society,<br />" +
    "                          VIT Chapter" +
    "                             </p>" +
    "                          </td>" +
    "                          <td class='expander' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; visibility: hidden; width: 0px; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0;' align='left' valign='top'></td>" +
    "                        </tr></table></td>" +
    "                  </tr></table><table class='row footer' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; position: relative; display: block; padding: 0px;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td class='wrapper' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; position: relative; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; background: #ebebeb; margin: 0; padding: 10px 20px 0px 0px;' align='left' bgcolor='#ebebeb' valign='top'>" +
    "                      <table class='six columns' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 280px; margin: 0 auto; padding: 0;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td class='left-text-pad' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0px 0px 10px 10px;' align='left' valign='top'>" +
    "                            <h5 style='color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; text-align: left; line-height: 1.3; word-break: normal; font-size: 24px; margin: 0; padding: 0 0 10px;' align='left'>Connect With Us:</h5>" +
    "                            <table class='tiny-button facebook' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; overflow: hidden; padding: 0;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: center; color: #ffffff; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; display: block; width: auto !important; background: #3b5998; margin: 0; padding: 5px 0 4px; border: 1px solid #2d4473;' align='center' bgcolor='#3b5998' valign='top'>" +
    "                                  <a href='https://www.facebook.com/gravitaspremierleague' style='color: #ffffff; text-decoration: none; font-weight: normal; font-family: Helvetica, Arial, sans-serif; font-size: 12px;'>Facebook</a>" +
    "                                </td>" +
    "                              </tr></table><br /><table class='tiny-button twitter' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left; width: 100%; overflow: hidden; padding: 0;'><tr style='vertical-align: top; text-align: left; padding: 0;' align='left'><td style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: center; color: #ffffff; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; display: block; width: auto !important; background: #00acee; margin: 0; padding: 5px 0 4px; border: 1px solid #0087bb;' align='center' bgcolor='#00acee' valign='top'>" +
    "                                  <a href='https://twitter.com/graVITasgpl' style='color: #ffffff; text-decoration: none; font-weight: normal; font-family: Helvetica, Arial, sans-serif; font-size: 12px;'>Twitter</a>" +
    "                                </td>" +
    "                              </tr></table><br /></td>" +
    "                          <td class='expander' style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: left; visibility: hidden; width: 0px; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0;' align='left' valign='top'></td>" +
    "                        </tr></table></td>" +
    "                  </tr></table><!-- container end below --></td>" +
    "            </tr></table></center>" +
    "            </td>" +
    "        </tr></table></body>" +
    "</html>");

try
{
    bcrypt = require('bcrypt');
}
catch (err)
{
    try
    {
        bcrypt = require('bcryptjs');
    }
    catch (err)
    {
        throw "Failure to compile run time requirement: bcrypt(js)";
    }
}

if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({token: process.env.LOGENTRIES_TOKEN});
}

router.get('/', function (req, res) {
    if (req.signedCookies.name)
    {
        if (log)
        {
            log.log(req.signedCookies.name + "logged in");
        }

        res.redirect('/home');
    }
    else if (process.env.NODE_ENV && process.env.LIVE === '0')
    {
        var time = new Date;
        time.setTime(time.getTime() + time.getTimezoneOffset() * 60000 + 19800000);
        var date =
        {
            seconds: time.getSeconds(),
            minutes: time.getMinutes(),
            hour: time.getHours(),
            day: time.getDate(),
            month: time.getMonth() + 1,
            year: time.getFullYear()
        };

        res.render('static', {date: date});
    }
    else
    {
        res.render('index');
    }
});

router.get('/interest', function (req, res) {
    if(process.env.LIVE === '0')
    {
        res.render('interest', {csrfToken: req.csrfToken()});
    }
    else
    {
        res.redirect('/register');
    }
});

router.post('/interest', function (req, res) // interest form
{
    var newUser =
    {
        name: req.body.name,
        regno: req.body.regno,
        email: req.body.email,
        phone: req.body.phone
    };

    var onInsert = function (err)
    {
        if (err)
        {
            console.log(err.message);
        }
        else
        {
            var onSend = function (err)
            {
                if (err)
                {
                    console.log(err.message);
                }
                else
                {
                    console.log('Sent!');
                }

                res.redirect('/interest');
            };

            interest.header.to = newUser.email;
            email.send(interest, onSend);
        }
    };

    mongoUsers.insert('interest', newUser, onInsert);
});

// TODO: delete this route when ready to launch
/*router.get(/\/^.*$/, function (req, res, next) {
    if (process.env.NODE_ENV && process.env.LIVE === '0')
    {
        res.redirect('/');
    }
    else
    {
        next();
    }
});*/

router.get('/login', function (req, res) {
    res.clearCookie('team', {});
    res.clearCookie('email', {});
    res.clearCookie('phone', {});

    if(req.signedCookies.name)
    {
        console.log(req.signedCookies.name);
        res.redirect('/home');
    }
    else if(req.signedCookies.admin)
    {
        res.redirect('/admin');
    }
    else
    {
        res.render('login', {csrfToken: req.csrfToken()});
    }
});

router.post('/login', function (req, res) {
    var password = req.body.password;
    var credentials =
    {
        '_id': req.body.team.trim().toUpperCase(),
        $or :
            [
                {
                    'authStrategy' : 'admin'
                },
                {
                    'authStrategy' : 'local'
                }
            ]
    };

    if (req.signedCookies.name)
    {
        res.clearCookie('name', {});
    }
    if (log)
    {
        log.log(user + "received");
    }

    var onFetch = function (err, doc)
    {
        if (err)
        {
            console.log(err.message);
            res.redirect('/login');
        }
        else if (doc)
        {
            if (bcrypt.compareSync(password, doc.password_hash))
            {
                res.cookie(ref[doc.authStrategy][0], doc._id, {signed: true, maxAge: 86400000});
                res.redirect(ref[doc.authStrategy][1]);
            }
            else
            {
                res.redirect('/login');
            }
        }
        else
        {
            res.redirect('/');
        }
    };

    mongoUsers.fetchUser(credentials, onFetch);
});

router.get('/forgot/password', function (req, res) {
    res.render('forgot', {csrfToken: req.csrfToken(), mode:'password'});
});

router.post('/forgot/password', function (req, res) {
    var doc =
    {
        _id: req.body.team.trim().toUpperCase(),
        email: req.body.email,
        authStrategy : 'local'
    };

    crypto.randomBytes(20, function (err, buf) {
        token = buf.toString('hex');
        password.header.to = req.body.email;
        password.attach_alternative("<table background='http://res.cloudinary.com/gpl/general/img1.jpg' align='center' cellpadding='0' cellspacing='0' width='600' style ='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
            "<tr><td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>graVITas Premier League</td>" +
            "</tr><tr><td style='color:#FFFFFF;' align=\'left\' style=\'padding: 2px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:large;\'> Please click <a href=\"http://" + req.headers.host + "/reset/" + token + "\">here</a> in order to reset your password.<br>" +
            "For the purposes of security, this link is valid for one use only, and shall expire in sixty minutes. <br> In the event that this password reset was not requested by you, please ignore this message and your password shall remain intact.<br>" +
            "</tr><tr><td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; font-weight: bold;'>Regards,<br>Team GPL<br>IEEE Computer Society<br>VIT Student chapter</td></tr></table>"
        );

        var onFetch = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else if (doc)
            {
                email.send(password, function (err)
                {
                    if (err)
                    {
                        console.log(err.message);
                    }
                    res.redirect('/login');
                });
            }
            else
            {
                res.redirect('/forgot/password');
            }
        };

        mongoUsers.forgotPassword(doc, token, onFetch);
    });
});

router.get('/reset/:token', function (req, res) {
    var onGetReset = function (err, doc)
    {
        if (err)
        {
            console.log(err.message);
            res.redirect('/forgot/password');
        }
        else if (!doc)
        {
            res.redirect('/forgot');
        }
        else
        {
            res.render('reset', {csrfToken: req.csrfToken()});
        }
    };

    mongoUsers.getReset({resetToken: req.params.token, expire: {$gt: Date.now()}}, onGetReset);
});

router.get('/forgot/user', function(req, res){
    res.render('forgot', {csrfToken: req.csrfToken(), mode:'user'});
});

router.post('/forgot/user', function (req, res) {
    var doc =
    {
        phone: req.body.phone,
        email: req.body.email
    };

    var onFetch = function (err, docs)
    {
        if (err)
        {
            console.log(err.message);
            res.redirect('/forgot/user');
        }
        else if (docs)
        {
            user.header.to = req.body.email;
            user.attach_alternative("The following teams were found in association with your details:<br><br><ol>" + docs + "</ol><br><br><br>Regards, <br>Team G.P.L<br>IEEE Computer Society");

            email.send(user, function (err) {
                if (err)
                {
                    console.log(err.message);
                }

                res.redirect('/login');
            });
        }
        else
        {
            console.log('Invalid credentials!');
            res.redirect('/forgot/user');
        }
    };
    mongoUsers.forgotUser(doc, onFetch);
});

router.post('/reset/:token', function (req, res) {
    if (req.body.password === req.body.confirm)
    {
        var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

        var onReset = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
                res.redirect('/reset/' + req.params.token);
            }
            else if (!doc)
            {
                console.log('No matches found!');
                res.redirect('/forgot');
            }
            else
            {
                reset.header.to = doc.value.email;
                reset.attach_alternative("<table background='http://res.cloudinary.com/gpl/general/img3.jpg' align='center' cellpadding='0' cellspacing='0' width='600' style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
                    "<tr><td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>graVITas Premier League</td>" +
                    "</tr><tr><td style='color:#FFFFFF;' align='left' style='padding: 5px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:x-large;'>Hey there, " + doc.value.manager_name + "!<br>We\'re just writing in to let you know that the recent password change for your team " +
                    doc.value._id + " was successful.<br>Welcome Back to G.P.L!" +
                    "</tr><tr><td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; font-weight: bold;'>Regards,<br>Team GPL<br>IEEE Computer Society<br>VIT Student chapter</td></tr></table>"
                );

                email.send(reset, function (err) {
                    if (err)
                    {
                        console.log(err.message);
                    }

                    res.redirect('/login');
                });
            }
        };

        mongoUsers.resetPassword(req.params.token, hash, onReset);
    }
    else // passwords do not match
    {
        res.redirect('/reset/' + req.params.token);
    }
});

router.get('/register', function (req, res) {
    if(process.env.DAY >= '1' && process.env.NODE_ENV)
    {
        res.redirect('/login');
    }
    if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('register', {response: "", csrfToken: req.csrfToken()});
    }
});

router.post('/register', function (req, res) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name', {});
    }
    var onGetCount = function (err, number)
    {
        if (err)
        {
            console.log(err.message);
            res.render('register', {response: "Unknown error, please try again", csrfToken : req.csrfToken()});
        }
        else
        {
            if (req.body.confirm === req.body.password)
            {
                var newUser = record;
                newUser._id = req.body.team_name.trim().toUpperCase();
                newUser.dob = new Date();
                newUser.team_no = parseInt(number) + 1;
                newUser.password_hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                newUser.manager_name = req.body.manager_name;
                newUser.email = req.body.email;
                newUser.phone = req.body.phone;
                newUser.authStrategy = 'local';

                var onInsert = function (err)
                {
                    if (err)
                    {
                        console.log(err.message);
                        res.render('register', {response: "Team Name Already Exists", csrfToken : req.csrfToken()});
                    }
                    else
                    {
                        register.header.to = newUser.email;
                        res.cookie('name', newUser._id, {maxAge: 86400000, signed: true});

                        email.send(register, function (err) {
                            if (err)
                            {
                                console.log(err.message);
                            }

                            res.redirect('/home/players');
                        });
                    }
                };

                mongoUsers.insert('users', newUser, onInsert);
            }
            else
            {
                console.log("Incorrect Password");
                res.render('register', {response: "Passwords do not match", csrfToken: req.csrfToken()});
            }
        }
    };
    mongoUsers.getCount({authStrategy : {$ne : 'admin'}}, onGetCount);
});

router.get('/logout', function (req, res) {
    if(req.signedCookies.admin)
    {
        res.clearCookie('admin', {});
        res.redirect('/');
    }
    else if (req.signedCookies.name)
    {
        res.clearCookie('name', {});
        res.clearCookie('team', {});
        res.clearCookie('email', {});
        res.clearCookie('phone', {});
        res.redirect('/login');
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/admin', function (req, res) {
    if (req.signedCookies.admin)
    {
        var onGetInfo = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
                res.redirect('/');
            }
            else if (doc)
            {
                res.render('admin', {info: doc});
            }
            else
            {
                res.redirect('/');
            }
        };

        mongoTeam.adminInfo(onGetInfo);
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/social/login', function (req, res) {
    if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('social', {mode: +!req.signedCookies.team, type : 'login', csrfToken : req.csrfToken()});
    }
});

router.post('/social/login', function (req, res) {
    res.cookie('team', req.body.team.trim().toUpperCase(), {signed : true});
    res.redirect('/social/login');
});

router.get('/social/register', function (req, res) {
    if(process.env.DAY >= 1 && process.env.NODE_ENV)
    {
        res.redirect('/login');
    }
    else if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('social', {mode: +!req.signedCookies.team, type : 'register', csrfToken : req.csrfToken()});
    }
});

router.post('/social/register', function (req, res) {
    res.cookie('team', req.body.team.trim().toUpperCase(), {signed : true});
    res.cookie('phone', req.body.phone, {signed : true});
    res.cookie('email', req.body.email, {signed : true});
    res.redirect('/social/register');
});

router.get('/social/callback', function (req, res) {
    if (req.signedCookies.team)
    {
        res.cookie('name', req.user._id, {maxAge: 86400000, signed: true});
        delete req.user;
        res.clearCookie('team', {});
        res.clearCookie('phone', {});

        if(req.signedCookies.email)
        {
            register.header.to = req.signedCookies.email;
            res.clearCookie('email', {});

            email.send(register, function (err) {
                if (err)
                {
                    console.log(err.message);
                }

                res.redirect('/home/players');
            });
        }
        else
        {
            res.redirect('/home/players');
        }
    }
    else
    {
        res.redirect('/');
    }
});

router.get(/\/developers?/, function (req, res) {
    res.render('developers');
});

router.get('/simulate', function (req, res) {
    if (req.signedCookies.admin)
    {
/*        var onSimulate = function (err, docs)
        {
            if (err)
            {
                console.log(err);
                res.redirect('/admin');
            }
            else
            {
                res.render('results', {results: docs});
            }
        };
        mongoFeatures.simulate(onSimulate);*/
    }
    res.redirect('/');
});

router.get('/rules', function (req, res) {
    res.render('rules', {session : +req.signedCookies.name});
});

router.get('/privacy', function (req, res) {
    res.render('privacy', {session : +req.signedCookies.name});
});

router.get('/trailer', function (req, res) // trailer page
{
    res.render('trailer');
});

router.get('/schedule', function (req, res) // schedule page
{
    res.redirect('/');
});

module.exports = router;