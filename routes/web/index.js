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

var bcrypt = require('bcrypt');
var express = require('express');
var path = require('path');
var router = express.Router();

var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var mongoInterest = require(path.join(__dirname, '..', '..', 'db', 'mongo-interest'));
var mongoUsers = require(path.join(__dirname, '..', '..', 'db', 'mongo-users'));


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
        res.render('index', {response: "" });
    }
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
            // Make it more user friendly, output the error to the view
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
            // Make it more user friendly, output the error to the view
            res.render('index', {response: "Incorrect Username"});
        }
    };
    mongoUsers.fetch(credentials, onFetch);
});


router.post('/forgot', function (req, res)
{
    var name = req.body.team_name;
    var email = req.body.email;

    var credentials = {
        '_id': name,
        '_email': email
    };
    var onFetch = function (err, doc)
    {
        if (err)
        {
            res.redirect('/');
        }
        else if (doc)
        {
            if (doc['email'] === credentials['email'] && doc['_id'] === credentials['_id'])
            {
                // email dispatcher
            }
            else
            {
                // wrong
            }
        }
        else
        {
            res.render('forgot', {Message: "No record"});
        }
    };
    mongoUsers.forgotPassword(credentials, onFetch);
});

router.get('/register', function (req, res)
{
    if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('register', { response: "" });
    }
});

router.post('/register', function (req, res)
{
    var onGetCount = function (err, number)
    {
        if (err)
        {
            // do something with the error
        }
        else
        {
            var team_no = parseInt(number) + 1;
            var teamName = req.body.team_name;
            var password = req.body.password;
            var confirmPassword = req.body.confirm_password;
            var managerName = req.body.manager_name;
            var email = req.body.email;
            var phone = req.body.phone;
            console.log("Reached");

            if (password === confirmPassword)
            {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(password, salt);
                var newUser = {

                    _id: teamName,
                    team_no: team_no,
                    password_hash: hashedPassword,
                    manager_name: managerName,
                    email: email,
                    phone: phone,
                    squad: [],
                    team: [],
                    win: 0,
                    played: 0,
                    points: 0,
                    runs_for: 0,
                    runs_against: 0,
                    balls_for: 0,
                    balls_against: 0,
                    net_run_rate: 0.0,
                    form : 0
                };
                var onInsert = function (err, docs)
                {
                    if (err)
                    {
                        console.log(err.message);
                        // Make it more user friendly, output the error to the view
                        res.render('register', {response: "Team Name Already Exists"});
                    }
                    else
                    {
                        var name = docs[0]['_id'];
                        res.cookie('name', name, {maxAge: 86400000, signed: true});
                        res.redirect('/home/players');
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
        res.clearCookie('name', { });
        res.redirect('/');
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/interest', function (req, res)
{
    res.redirect('/');
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
            // do something
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
    var session;
    if (req.signedCookies.name)
    {
        session = 1;
    }
    else
    {
        session = 0;
    }
    res.render('developer', {results: session });
});
router.get('/countdown', function (req, res) // page for countdown
{
    var session;
    if (req.signedCookies.name)
    {
        session = true;
    }
    else
    {
        session = false;
    }
    res.render('countdown', {Session: session});
});

router.get('/prizes', function (req, res) // page to view prizes
{
    var session;
    if (req.signedCookies.name)
    {
        session = true;
    }
    else
    {
        session = false;
    }
    res.render('prizes', {Session: session });
});

router.get('/rule', function (req, res)
{
    var session;
    if (req.signedCookies.name)
    {
        session = 1;
    }
    else
    {
        session = 0;
    }
    res.render('rule', {results: session });
});

router.get('/sponsor', function (req, res) // sponsors page
{
    var session;
    if (req.signedCookies.name)
    {
        session = 1;
    }
    else
    {
        session = 0;
    }
    res.render('sponsor', {results: session });
});

router.get('/trail', function (req, res) // trailer page
{
    var session;
    if (req.signedCookies.name)
    {
        session = 1;
    }
    else
    {
        session = 0;
    }
    res.render('trail', {results: session });
});
router.get('/schedule', function (req, res) // schedule page
{
    var session;
    if (req.signedCookies.name)
    {
        session = 1;
    }
    else
    {
        session = 0;
    }
    res.render('schedule', {results: session });
});

module.exports = router;
