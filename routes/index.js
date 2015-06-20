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
var bcrypt;
var path = require('path');
var crypto = require('crypto');
var routes = {
    'lead' : '/home/leaderboard',
    'match'  : '/home/matches',
    'player' : '/home/players',
    'team' : '/home/team'
};
var router = require('express').Router();
var email = require(path.join(__dirname, '..', 'email.js'));
var mongoUsers = require(path.join(__dirname, '..', 'db', 'mongo-users'));
var mongoInterest = require(path.join(__dirname, '..', 'db', 'mongo-interest'));

try{
    bcrypt = require('bcrypt');
}
catch(err){
    try
    {
        bcrypt = require('bcryptjs');
    }
    catch(err)
    {
        throw "Unexpected Bcrypt(js) error encountered...";
    }
}

if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

router.get('/', function (req, res)
{
    if (req.signedCookies.name)
    {
        if (log)
        {
            log.log(req.signedCookies.name + "logged in");
        }
        res.redirect('/home');
    }
    else
    {
        var time = new Date;
        time.setTime(time.getTime() + time.getTimezoneOffset() * 60000 + 19800000);
        var date = {
            seconds : time.getSeconds(),
            minutes : time.getMinutes(),
            hour : time.getHours(),
            day : time.getDate(),
            month : time.getMonth() + 1,
            year : time.getFullYear()
        };
        res.render('static', {date: date});
    }
});

// TODO: delete this route when ready to launch
router.get(/^.*$/, function(req, res){
    res.redirect('/');
});

router.post('/login', function (req, res)
{
    var teamName = req.body.team_name;
    var password = req.body.password;
    if (req.signedCookies.name) res.clearCookie('name', { });
    if (log)
    {
        log.log(teamName + " " + password + "recieved");
    }

    var credentials = {
        '_id': teamName
    };
    var onFetch = function (err, doc)
    {
        if (err)
        {
            console.log(err.message);
            res.render('index', {response: "Incorrect Username"});
        }
        else if (doc)
        {
            if (bcrypt.compareSync(password, doc['password_hash']))
            {
                console.log("Login Successful" + teamName);
                res.cookie('name', doc['_id'], {maxAge: 86400000, signed: true});
                res.redirect('/home');
            }
            else
            {
                console.log('Incorrect Credentials');
                res.render('index', {response: "Incorrect Password"});
            }
        }
        else
        {
            console.log('No user exists');
            res.render('index', {response: "Incorrect Username"});
        }
    };
    mongoUsers.fetch(credentials, onFetch);
});

router.post('/forgot/password', function (req, res)
{
    var doc = {
        _id : req.body.team,
        email : req.body.email
    };
    var onFetch = function(err, doc){
        if(err)
        {
            console.log(err.message);
        }
        else if(doc)
        {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                var options = {
                    from: 'gravitaspremierleague@gmail.com',
                    to: req.body.email,
                    subject: 'Time to get back in the game',
                    html: "<table background='GPL/public/images/img8.jpg' align='center' cellpadding='0' cellspacing='0' width='600' style ='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
                    "<tr><td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>graVITas Premier League</td>" +
                    "</tr><tr><td align=\'center\' style=\'padding: 2px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:large;\'> Please click <a href=\"http://" + req.headers.host + "/reset/" + token + "\">here</a>" + " in order to reset your password.<br>" +
                    "In the event that this password reset was not requested by you," +
                    " please ignore this message and your password shall remain intact.<br>"
                    "</tr><tr><td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; font-weight: bold;'>Regards:<br>Team GPL<br>IEEE-COMPUTER SOCIETY</td></tr></table>"
                };

                email.sendMail(options, function(err) {
                    if(err)
                    {
                        console.log(err.message);
                    }
                    else
                    {
                        res.redirect('/login');
                    }
                });
            });
        }
        else
        {
            console.log('Invalid credentials!');
            res.redirect('/forgot');
        }
    };
    mongoUsers.forgotPassword(doc, onFetch);
});

router.post('/forgot/user', function (req, res)
{
    var doc = {
        phone : req.body.phone,
        email : req.body.email
    };
    var onFetch = function(err, docs){
        if(err)
        {
            console.log(err.message);
        }
        else if(docs)
        {
            var options = {
                from: 'gravitaspremierleague@gmail.com',
                to: req.body.email,
                subject: 'Time to get back in the game',
                html: "The following teams were found in association with your details:<br><br><ol>" + docs + "</ol><br><br><br>Regards, <br>Team G.P.L."
            };

            email.sendMail(options, function(err) {
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    res.redirect('/login');
                }
            });
        }
        else
        {
            console.log('Invalid credentials!');
            res.redirect('/forgot/user');
        }
    };
    mongoUsers.forgotPassword(doc, onFetch);
});

router.post('/reset/:token', function(req, res) {
    var query = {token : req.params.token, expire : {$gt: Date.now()}};
    var op = {
        $set : {
            password_hash : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
        },
        $unset : {
            token : '',
            expire : ''
        }
    };
    var onReset = function(err, doc)
    {
        if(err)
        {
            console.log(err.message);
        }
        else if(!doc)
        {
            console.log('No matches found!');
            res.redirect('/forgot');
        }
        else
        {
            var options = {
                to : doc.email,
                subject : 'Password change successful !
                text : "<table background='GPL/public/images/img8.jpg' align='center' cellpadding='0' cellspacing='0' width='600' style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
            "<tr><td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>graVITas Premier League</td>" +
            "</tr><tr><td align='center' style='padding: 5px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:x-large;'>'Hey there, ' + doc.email.split('@')[0] + ' we\'re just writing in to let you know that the recent password change was successful.' + <br>" +
            "</tr><tr><td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; font-weight: bold;'>Regards:<br>Team GPL<br>IEEE-COMPUTER SOCIETY</td></tr></table>"
            };
            email.sendMail(options, function(err) {
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    console.log('Updated successfully!');
                    res.redirect('/login');
                }
            });
        }
    };
    mongoUsers.resetPassword(query, op, onReset);
});

router.get('/register', function (req, res)
{
    if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('register', { response: "", csrfToken : req.csrfToken() });
    }
});

router.post('/register', function (req, res)
{
    var onGetCount = function (err, number)
    {
        if (err)
        {
            console.log(err.message);
        }
        else
        {
            console.log("Reached");

            if (req.body.confirm_password === req.body.password)
            {
                var newUser =
                {
                    _id : req.body.team_name,
                    dob : new Date(),
                    team_no : parseInt(number) + 1,
                    password_hash : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
                    manager_name : req.body.manager_name,
                    email : req.body.email,
                    phone : req.body.phone,
                    squad : [],
                    team : [],
                    win : 0,
                    loss : 0,
                    tied : 0,
                    played : 0,
                    points : 0,
                    ratio : 0.0,
                    runs_for: 0,
                    runs_against : 0,
                    balls_for : 0,
                    balls_against: 0,
                    net_run_rate: 0.0,
                    wickets_taken : 0,
                    wickets_lost : 0,
                    toss : 0,
                    form : 1,
                    morale : 0.0,
                    streak: 0,
                    all_outs: 0,
                    avg_runs_for : 0.0,
                    avg_runs_against : 0.0,
                    avg_wickets_lost : 0.0,
                    avg_wickets_taken : 0.0,
                    avg_overs_for : 0.0,
                    avg_overs_against : 0.0,
                    highest_total : -1,
                    lowest_total : Number.MAX_VALUE,
                    stats : {},
                    surplus : 0
                };
                var onInsert = function (err, docs)
                {
                    if (err)
                    {
                        console.log(err.message);
                        res.render('register', {response: "Team Name Already Exists"});
                    }
                    else
                    {
                        var name = docs[0]['_id'];
                        var options = {
                            from : 'gravitaspremierleague@gmail.com',
                            to : docs[0]['email'],
                            subject : 'Welcome to graVITas premier league 2.0!',

                            html : "<table background='GPL/public/images/img8.jpg' align='center' cellpadding='0' cellspacing='0' width='600' style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
                        "<tr><td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>graVITas Premier League</td>" +
                        "</tr><tr><td align='center' style='padding: 5px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:x-large;'> This is to inform that that you have successfully registered for GPL 2.0 <br>" +
                        "Please click <a href='http://gravitaspremierleague.com' style='text-decoration: none;'> here </a> for more details<br> Good luck!  </td>" +
                        "</tr><tr><td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; font-weight: bold;'>Regards:<br>Team GPL<br>IEEE-COMPUTER SOCIETY</td></tr></table>"

                            html : 'Hey there,' + docs[0].manager_name + ', you have just embarked on a mind-blowing journey in the world of T20 cricket management.<br>Regards,<br>Team G.P.L'
                        };
                        res.cookie('name', name, {maxAge: 86400000, signed: true});
                        res.redirect('/home/players');
                        email.sendMail(options, null);
                    }
                };
                mongoUsers.insert(newUser, onInsert);
            }
            else
            {
                console.log("Incorrect Password");
                res.render('register', {response: "Passwords do not match"});
            }
        }
    };
    mongoUsers.getCount(onGetCount);
});

router.get('/logout', function (req, res)
{
    if (req.signedCookies.name)
    {
        res.clearCookie('name');
        res.clearCookie('lead');
        res.redirect('/login');
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/interest', function (req, res)
{
    res.redirect('/', {csrfToken : req.csrfToken()});
});

router.post('/interest', function (req, res) // interest form
{
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var newUser = {
        name: name,
        email: email,
        phone: phone
    };
    var onInsert = function (err, docs)
    {
        if (err)
        {
            console.log(err.message);
        }
        else
        {
            res.redirect('/interest');
            console.log(docs);
        }

    };
    mongoInterest.insert(newUser, onInsert);
});

router.get('/developer', function (req, res) // developers page
{
    res.render('developer', {results: (req.signedCookies.name ? 1 : 0)});
});

router.get('/countdown', function (req, res) // page for countdown
{
    res.render('countdown', {Session: (req.signedCookies.name ? 1 : 0)});
});

router.get('/prizes', function (req, res) // page to view prizes
{
    res.render('prizes', {Session: (req.signedCookies.name ? 1 : 0)});
});

router.get('/rule', function (req, res)
{
    res.render('rule', {results: (req.signedCookies.name ? 1 : 0)});
});

router.get('/sponsor', function (req, res) // sponsors page
{
    res.render('sponsor', {results: (req.signedCookies.name ? 1 : 0)});
});

router.get('/trail', function (req, res) // trailer page
{
    res.render('trail', {results: (req.signedCookies.name ? 1 : 0)});
});

router.get('/schedule', function (req, res) // schedule page
{
    res.render('schedule', {results: (req.signedCookies.name ? 1 : 0) });
});

module.exports = router;