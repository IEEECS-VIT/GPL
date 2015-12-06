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
var time;
var date;
var user;
var reset;
var token;
var bcrypt;
var newUser;
var ref =
{
    'admin':
    [
        'admin',
        '/admin'
    ],
    'local':
    [
        'name',
        '/home'
    ]
};
var credentials;
var path = require('path');
var crypto = require('crypto');
var router = require('express').Router();
var record = require(path.join(__dirname, '..', 'db', 'mongo-record'));
var mongoTeam = require(path.join(__dirname, '..', 'db', 'mongo-team'));
var mongoUsers = require(path.join(__dirname, '..', 'db', 'mongo-users'));
var developers = require(path.join(__dirname, '..', 'package.json')).contributors;
developers.map((arg) => arg.map((x) => x.img = x.name.split(' ')[0]));

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
    log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}

router.get('/', function (req, res){
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
        time = new Date;
        time.setTime(time.getTime() + time.getTimezoneOffset() * 60000 + 19800000);
        date =
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

router.get('/interest', function (req, res){
    if(process.env.LIVE === '0' || !process.env.NODE_ENV || req.signedCookies.admin)
    {
        res.render('interest', {csrfToken: req.csrfToken()});
    }
    else
    {
        res.redirect('/register');
    }
});

router.post('/interest', function (req, res){
    newUser =
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
            res.redirect('/interest');
        }
    };

    mongoUsers.insert('interest', newUser, onInsert);
});

router.get('/login', function (req, res){
    res.clearCookie('team', {});
    res.clearCookie('phone', {});

    if(req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else if(req.signedCookies.admin)
    {
        res.redirect('/admin');
    }
    else
    {
        res.render('login', {csrfToken: req.csrfToken(), response: ""});
    }
});

router.post('/login', function (req, res){
    credentials =
    {
        _id: req.body.team.trim().toUpperCase(),
        $or:
        [
            {
                authStrategy: 'admin'
            },
            {
                authStrategy: 'local'
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
            res.render('login', {response: "Incorrect credentials!", type:"danger", csrfToken: req.csrfToken()});
        }
        else if (doc)
        {
            if (bcrypt.compareSync(req.body.password, doc.password_hash))
            {
                res.cookie(ref[doc.authStrategy][0], doc._id, {signed: true, maxAge: 86400000});
                res.redirect(ref[doc.authStrategy][1]);
            }
            else
            {
                res.render('login', {response: "Incorrect credentials!", type:"danger", csrfToken: req.csrfToken()});
            }
        }
        else
        {
            res.render('login', {response: "Incorrect credentials!", type:"danger", csrfToken: req.csrfToken()});
        }
    };

    mongoUsers.fetchUser(credentials, onFetch);
});

router.get(/^\/forgot\/password|user$/, function (req, res){
    res.render('forgot', {csrfToken: req.csrfToken(), mode: req.originalUrl.split('/')[2]});
});

router.post('/forgot/password', function (req, res){
    credentials =
    {
        _id: req.body.team.trim().toUpperCase(),
        email: req.body.email,
        authStrategy : 'local'
    };

    crypto.randomBytes(20, function (err, buf){
        token = buf.toString('hex');

        var onFetch = function (err, doc)
        {
            if (err || !doc)
            {
                console.log(err.message);
                res.redirect('/forgot/password');
            }
            else
            {
                res.redirect('/login');
            }
        };

        mongoUsers.forgotPassword(credentials, token, req.headers.host, onFetch);
    });
});

router.get('/reset/:token', function (req, res){
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

router.post('/reset/:token', function (req, res){
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
                res.redirect('/forgot');
            }
            else
            {
                res.redirect('/login');
            }
        };

        mongoUsers.resetPassword(req.params.token, hash, onReset);
    }
    else // passwords do not match
    {
        res.redirect('/reset/' + req.params.token);
    }
});

router.post('/forgot/user', function (req, res){
    credentials =
    {
        phone: req.body.phone,
        email: req.body.email
    };

    var onFetch = function (err, docs)
    {
        if (err || !docs)
        {
            console.log(err.message);
            res.redirect('/forgot/user');
        }
        else
        {
            res.redirect('/login');
        }
    };

    mongoUsers.forgotUser(credentials, onFetch);
});

router.get('/register', function (req, res){
    if(!process.env.NODE_ENV || (process.env.DAY === '0' && process.env.MATCH == 'users' && process.env.LIVE === '1')) // Initialize process.env.DAY with -1, set to 0 when registrations are open, set to 1 once
    {                                                                                                                  // the schedule has been constructed and the game engine is match ready.
        res.render('register', {response: "", csrfToken: req.csrfToken()});
    }
    else if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.redirect('/login');
    }
});

router.post('/register', function (req, res){
    res.clearCookie('name', {});
    res.clearCookie('admin', {});

    var onGetCount = function (err, number)
    {
        if (err)
        {
            console.log(err.message);
            res.render('register', {response: "Unknown error, please try again", type:"danger", csrfToken: req.csrfToken()});
        }
        else
        {
            if (req.body.confirm === req.body.password)
            {
                newUser = record;
                newUser.dob = new Date();
                newUser.email = req.body.email;
                newUser.phone = req.body.phone;
                newUser.authStrategy = 'local';
                newUser.team_no = parseInt(number) + 1;
                newUser.manager_name = req.body.manager_name; // TODO: treat manager_name as _id, to make the creation of multiple teams for one manager possible
                newUser._id = req.body.team.trim().toUpperCase();
                newUser.password_hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

                var onInsert = function (err)
                {
                    if (err)
                    {
                        console.log(err.message);
                        res.render('register', {response: "Team Name Already Exists", type: "danger", csrfToken: req.csrfToken()});
                    }
                    else
                    {
                        res.cookie('name', newUser._id, {maxAge: 86400000, signed: true});
                        res.redirect('/home/players');
                    }
                };

                mongoUsers.insert(process.env.MATCH, newUser, onInsert);
            }
            else
            {
                res.render('register', {response: "Passwords do not match", type: "danger", csrfToken: req.csrfToken()});
            }
        }
    };

    mongoUsers.getCount({authStrategy : {$ne : 'admin'}}, onGetCount);
});

router.get('/logout', function (req, res){
    res.clearCookie('team', {});
    res.clearCookie('phone', {});
    res.clearCookie('admin', {});
    res.clearCookie('name', {});
    res.redirect('/login');
});

router.get('/admin', function (req, res){
    if (req.signedCookies.admin || !process.env.NODE_ENV)
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
                res.redirect('/login');
            }
        };

        mongoTeam.adminInfo(onGetInfo);
    }
    else
    {
        res.redirect('/login');
    }
});

router.get('/social/login', function (req, res){
    if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('social', {mode: +!req.signedCookies.team, type : 'login', csrfToken : req.csrfToken()});
    }
});

router.post('/social/login', function (req, res){
    res.cookie('team', req.body.team.trim().toUpperCase(), {maxAge : 300000, signed : true});
    res.redirect('/social/login');
});

router.get('/social/register', function (req, res){
    if(!process.env.NODE_ENV || (process.env.DAY === '0' && process.env.MATCH === 'users' && process.env.LIVE === '1')) // Initialize process.env.DAY with -1, set to 0 when registrations are open, set to 1 once
    {                                                                                                                   // the schedule has been constructed and the game engine is match ready
        res.render('social', {mode: +!req.signedCookies.team, type : 'register', csrfToken : req.csrfToken()});
    }
    else if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.redirect('/login');
    }
});

router.post('/social/register', function (req, res){
    res.cookie('team', req.body.team.trim().toUpperCase(), {maxAge: 300000, signed: true});
    res.cookie('phone', req.body.phone, {maxAge: 300000, signed: true});
    res.redirect('/social/register');
});

router.get(/\/developers?/, function (req, res){
    res.render('developers', {obj: developers});
});

router.get('/simulate', function (req, res){
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
        res.redirect('/admin');
    }
    else
    {
        res.redirect('/login');
    }
});

router.get(/^\/rules|privacy$/, function (req, res){
    res.render(req.originalUrl.slice(1), {session : +!req.signedCookies.name});
});

router.get('/trailer', function (req, res){ // trailer page
    res.render('trailer');
});

router.get('/schedule', function (req, res){ // schedule page
    res.redirect('/');
});

router.get('/check/:name', function(req, res){
    if(req.headers.referer && req.headers.referer.split('/')[2] === req.headers.host)
    {
        mongoUsers.fetchUser({_id: req.params.name.trim().toUpperCase()}, function(err, result){
            res.send(!result);
        })
    }
    else
    {
        res.end();
    }
});

module.exports = router;