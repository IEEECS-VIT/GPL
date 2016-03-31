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
var crypto = require('crypto');
var path = require('path').join;
var router = require('express').Router();
var mongoTeam = require(path(__dirname, '..', 'database', 'mongoTeam'));
var mongoUsers = require(path(__dirname, '..', 'database', 'mongoUsers'));
var record = require(path(__dirname, '..', 'database', 'mongoRecord')).schema;
var developers = require(path(__dirname, '..', 'package.json')).contributors;
developers.map((arg) => arg.map((x) => x.img = x.name.split(' ')[0]));

var cookieFilter = function(req, res, next)
{
    if(req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        return next();
    }
};

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

router.get('/', cookieFilter, function (req, res){
    if (process.env.NODE_ENV && process.env.DAY === '-1')
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
    if(process.env.DAY === '-1' || !process.env.NODE_ENV || req.signedCookies.admin)
    {
        res.render('interest', {csrfToken: req.csrfToken()});
    }
    else
    {
        res.redirect('/register');
    }
});

router.post('/interest', function (req, res, next){
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
            res.status(422);
            return next(err);
        }

        res.redirect('/interest');
    };

    mongoUsers.insert('interest', newUser, onInsert);
});

router.get('/login', cookieFilter, function (req, res){
    res.clearCookie('team', {});
    res.clearCookie('phone', {});

    res.render('login', {csrfToken: req.csrfToken(), msg: req.flash()});
});

router.post('/login', cookieFilter, function (req, res){
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

    res.clearCookie('name', {});

    if (log)
    {
        log.log(user + "received");
    }

    var onFetch = function (err, doc)
    {
        if (err)
        {
            req.flash('Incorrect credentials!');
            res.redirect('/login');
        }
        else if (doc)
        {
            bcrypt.compare(req.body.password, doc.passwordHash, function(err, result){
                if(err)
                {
                    req.flash('An unexpected error has occurred, please re-try.');
                    res.redirect('/login');
                }
                else if(result)
                {
                    res.cookie(ref[doc.authStrategy][0], doc._id, {signed: true, maxAge: 86400000, httpOnly: true});
                    res.redirect(ref[doc.authStrategy][1]);
                }
                else
                {
                    req.flash('Incorrect credentials!');
                    res.redirect('/login');
                }
            });
        }
        else
        {
            req.flash('Incorrect credentials!');
            res.redirect('/login');
        }
    };

    mongoUsers.fetchUser(credentials, onFetch);
});

router.get(/^\/forgot\/password|user$/, function (req, res){
    res.render('forgot', {csrfToken: req.csrfToken(), mode: req.url.split('/')[2], msg: req.flash()});
});

router.post('/forgot/password', function (req, res){
    credentials =
    {
        _id: req.body.team.trim().toUpperCase(),
        email: req.body.email,
        $or:
        [
            {
                authStrategy : 'local'
            },
            {
                authStrategy : 'admin'
            }
        ]
    };

    crypto.randomBytes(20, function (err, buf){
        if(err)
        {
            req.flash('An unexpected error has occurred, please re-try.');
            res.redirect('/forgot/password');
        }

        token = buf.toString('hex');

        var onFetch = function (error, doc)
        {
            if (error || !doc)
            {
                req.flash('Incorrect credentials!');
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
            req.flash('That password reset link had expired, or is invalid.');
            res.redirect('/forgot/password');
        }
        else if (!doc)
        {
            res.redirect('/forgot/password');
        }
        else
        {
            res.render('reset', {csrfToken: req.csrfToken(), msg: req.flash()});
        }
    };

    mongoUsers.getReset({resetToken: req.params.token, expire: {$gt: Date.now()}}, onGetReset);
});

router.post('/reset/:token', function (req, res){
    if (req.body.password === req.body.confirm)
    {
        var onReset = function (err, doc)
        {
            if (err)
            {
                req.flash('That request failed, please re-try.');
                res.redirect('/reset/' + req.params.token);
            }
            else if (!doc)
            {
                res.redirect('/forgot/password');
            }
            else
            {
                res.redirect('/login');
            }
        };

        bcrypt.hash(req.body.password, 10, function(err, hash){
            if(err)
            {
                req.flash('An unexpected error has occurred, and your password could not be rest. Please re-try.');
                res.redirect('/reset/' + req.params.token);
            }
            else
            {
                mongoUsers.resetPassword(req.params.token, hash, onReset);
            }
        });
    }
    else // passwords do not match
    {
        req.flash('Passwords do not match.');
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
            req.flash('Invalid credentials!');
            res.redirect('/forgot/user');
        }
        else
        {
            res.redirect('/login');
        }
    };

    mongoUsers.forgotUser(credentials, onFetch);
});

router.get('/register', cookieFilter, function (req, res){
    if(!process.env.NODE_ENV || (process.env.DAY === '0' && process.env.MATCH === 'users')) // Initialize process.env.DAY with -1, set to 0 when registrations are open, set to 1 once
    {                                                                                       // the schedule has been constructed and the game engine is match ready.
        res.render('register', {msg: req.flash(), csrfToken: req.csrfToken()});
    }
    else
    {
        res.redirect('/login');
    }
});

router.post('/register', cookieFilter, function (req, res){
    res.clearCookie('name', {});
    res.clearCookie('admin', {});

    if (req.body.confirm === req.body.password)
    {
        var onInsert = function (err)
        {
            if (err)
            {
                req.flash('This team name already exists.');
                res.redirect('/register');
            }
            else
            {
                res.cookie('name', newUser._id, {maxAge: 86400000, signed: true});
                res.redirect('/home/players');
            }
        };

        newUser = record();
        newUser.dob = new Date();
        newUser.email = req.body.email;
        newUser.phone = req.body.phone;
        newUser.authStrategy = 'local';
        newUser.managerName = req.body.managerName; // treat managerName / email address as _id, to make the creation of multiple teams for one manager possible
        newUser._id = req.body.team.trim().toUpperCase();

        bcrypt.hash(req.body.password, 10, function(err, hash){
            if(err)
            {
                req.flash('An unexpected error occurred and your details could not be saved. Please re-try.');
                res.redirect('/register');
            }
            else
            {
                newUser.passwordHash = hash;
                mongoUsers.insert(process.env.MATCH, newUser, onInsert);
            }
        });
    }
    else
    {
        req.flash('Passwords do not match');
        res.redirect('/register');
    }
});

router.get('/logout', function (req, res){
    res.clearCookie('team', {});
    res.clearCookie('phone', {});
    res.clearCookie('admin', {});
    res.clearCookie('name', {});
    res.clearCookie('lead', {});
    res.clearCookie('dash', {});
    res.clearCookie('stats', {});
    res.redirect('/login');
});

router.get('/admin', function (req, res){
    if (req.signedCookies.admin || !process.env.NODE_ENV)
    {
        var onGetInfo = function (err, doc)
        {
            if (err)
            {
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

router.get('/social/login', cookieFilter, function (req, res){
    if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('social', {mode: +!req.signedCookies.team, type: 'login', csrfToken: req.csrfToken()});
    }
});

router.post('/social/login', cookieFilter, function (req, res){
    res.cookie('team', req.body.team.trim().toUpperCase(), {maxAge : 300000, signed : true});
    res.redirect('/social/login');
});

router.get('/social/register', cookieFilter, function (req, res){
    if(!process.env.NODE_ENV || (process.env.DAY === '0' && process.env.MATCH === 'users')) // Initialize process.env.DAY with -1, set to 0 when registrations are open,
    {                                                                                       // will be updated to 1 when the schedule has been constructed and the game
                                                                                            // engine is match ready.
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

router.post('/social/register', cookieFilter, function (req, res){
    res.cookie('team', req.body.team.trim().toUpperCase(), {maxAge: 300000, signed: true});
    res.cookie('phone', req.body.phone, {maxAge: 300000, signed: true});
    res.redirect('/social/register');
});

router.get('/developers', function (req, res){
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

router.get('/rules', function (req, res){
    res.render('rules', {session : +!req.signedCookies.name});
});

router.get('/privacy', function (req, res){
    res.render('privacy', {session : +!req.signedCookies.name});
});

router.get('/trailer', function (req, res){ // trailer page
    res.render('trailer');
});

router.get('/schedule', function (req, res){ // schedule page
    res.redirect('/');
});

module.exports = router;
