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

var i;
var temp;
var squad;
var referer;
var decider;
var condition;
var credentials;
var async = require('async');
var path = require('path').join;
var router = require('express').Router();
var mongoTeam = require(path(__dirname, '..', 'db', 'mongo-team'));
var mongoUsers = require(path(__dirname, '..', 'db', 'mongo-users'));
var mongoFeatures = require(path(__dirname, '..', 'db', 'mongo-features'));
var apiFilter = function(req, res, next)
{
    if(!req.headers.referer)
    {
        res.redirect('/');
    }

    temp = req.url.split('/')[1];
    referer = req.headers.referer.split('/');
    condition = (referer[2] === req.headers.host && referer.slice(-1)[0] === temp);
    decider = (temp === 'register' && (!process.env.NODE_ENV || (process.env.DAY === '0' && process.env.MATCH === 'users')));
    condition &= (decider ? !req.signedCookies.name : req.signedCookies.name);

    if(condition)
    {
        next();
    }
    else
    {
        res.end();
    }
};

router.get('/register/:name', apiFilter, function(req, res){
    mongoUsers.fetchUser({_id: req.params.name.trim().toUpperCase()}, function(err, user){
        res.send(!(user && err));
    });
});

router.get('/home', apiFilter, function(req, res){
    credentials =
    {
        '_id': req.signedCookies.name
    };

    var onFetch = function (err, doc)
    {
        if (err)
        {
            res.status(422);
            res.send('Error fetching team details. Please re-try.');
        }
        else if (doc)
        {
            if (!doc.team.length)
            {
                res.status(422);
                res.send('Please pick your set of 16 players first.');
            }
            else if(!doc.squad.length)
            {
                res.status(422);
                res.send('Please set your playing XI first.');
            }
            else
            {
                var onFinish = function (err, documents)
                {
                    if (err)
                    {
                        res.status(422);
                        res.send('An unexpected error has occurred and your details could not be fetched. Please re-try.');
                    }
                    else
                    {
                        doc.balls_for = parseInt(doc.balls_for / 6, 10) + '.' + (doc.balls_for % 6);
                        doc.balls_against = parseInt(doc.balls_against / 6, 10) + '.' + (doc.balls_against % 6);
                        res.json({team: documents, user: doc});
                    }
                };

                async.map(doc.team, mongoFeatures.getPlayer, onFinish);
            }
        }
        else
        {
            res.status(422);
            res.clearCookie('name', {});
            res.send('That session had expired, please login.');
        }
    };

    mongoUsers.fetchUser(credentials, onFetch);
});

router.get('/leaderboard', apiFilter, function(req, res){
    if(req.signedCookies.lead && req.signedCookies.day === process.env.DAY)
    {
        res.json(JSON.parse(req.signedCookies.lead));
    }
    else if (process.env.DAY > '0'|| !process.env.NODE_ENV) // if cookie exists then access the database
    {
        var onFetch = function (err, documents)
        {
            if (err)
            {
                res.status(422);
                res.send('Unable to process the leaderboard at this time, please re-try');
            }
            else
            {
                res.cookie('day', process.env.DAY, {signed : true, maxAge : 86400000});
                res.cookie('lead', JSON.stringify(documents), {signed : true, maxAge : 86400000});
                res.json(documents);
            }
        };

        mongoUsers.getLeader(req.signedCookies.name, onFetch);
    }
    else
    {
        res.status(422);
        res.send('The leaderboard will become active when matches start.');
    }
});

router.get('/match/:day', apiFilter, function(req, res){
    if(process.env.DAY > '0' && req.params.day > '0' && req.params.day < '8')
    {
        credentials =
        {
            '_id' : req.signedCookies.name
        };

        var onMap = function (err, num)
        {
            if (err)
            {
                res.status(422);
                res.send('Error loading match ' + req.params.day + 'details.');
            }
            else
            {
                var onMatch = function (err, match)
                {
                    if (err)
                    {
                        res.status(422);
                        res.send('Error loading match ' + req.params.day + 'details.');
                    }
                    else
                    {
                        res.cookie('day', process.env.DAY, {signed : true, maxAge : 86400000});
                        res.json({match: match || {}, day : (process.env.DAY - 1) || 0, round : ref[process.env.MATCH]});
                    }
                };

                mongoFeatures.match(req.params.day, num, onMatch);
            }
        };

        mongoTeam.map(credentials, onMap);
    }
    else
    {
        res.status(422);
        res.send('Either registrations are still open, or the match day is invalid.');
    }
});

router.post('/getsquad', apiFilter, function (req, res) {
    credentials =
    {
        '_id': req.signedCookies.name
    };
    squad = [];

    for (i = 1; i < 12; ++i)
    {
        squad.push(req.body['p' + i]);
    }

    var onFetch = function (err)
    {
        if (err)
        {
            res.status(422);
            res.send('That request encountered an error, please re-try.');
        }

        res.redirect('/home');
    };

    mongoUsers.updateMatchSquad(credentials, squad, onFetch);
});

router.get('/players', apiFilter, function (req, res){ // page for all players, only available if no squad has been chosen
    credentials =
    {
        "_id": req.signedCookies.name
    };

    var onFetchUser = function (err, document)
    {
        if (err)
        {
            res.status(422);
            res.send('That request encountered an error, please re-try.');
        }
        else
        {
            if (document.team.length)
            {
                if (!document.squad.length)
                {
                    res.status(422);
                    res.send('Your set of 16 players already exists, pick your playing XI.');
                }
                else
                {
                    res.status(422);
                    res.send('Your squad and team are already set.');
                }
            }
            else
            {
                var onFetch = function (err, documents)
                {
                    if (err)
                    {
                        res.status(422);
                        res.send('Error loading player data. Please re-try.');
                    }
                    else
                    {
                        var map = function(arg)
                        {
                            arg.active = false;
                            arg.image = ("https://res.cloudinary.com/gpl/players/" + arg.Type + "/" + arg._id + ".jpg");
                        };

                        var onMap = function(err, result)
                        {
                            if(err)
                            {
                                res.status(422);
                                res.send('Error processing player details, please re-try.');
                            }
                            else
                            {
                                res.json({Players: result, csrfToken: req.csrfToken()});
                            }
                        };

                        async.map(documents, map, onMap);
                    }
                };

                mongoFeatures.fetchPlayers(onFetch);
            }
        }
    };

    mongoUsers.fetchUser(credentials, onFetchUser);
});

router.get('/team', apiFilter, function (req, res){ // view the assigned playing 11 with options to change the playing 11
    credentials =
    {
        '_id': req.signedCookies.name
    };

    var getTeam = function (err, documents)
    {
        if (err)
        {
            res.status(422);
            res.send('Error loading team data.');
        }
        else
        {
            res.json({Squad: documents, csrfToken: req.csrfToken()});
        }
    };

    mongoTeam.getTeam(credentials, getTeam);
});

router.get('/stats', apiFilter, function(req, res){
    if(req.signedCookies.stats && req.signedCookies.day === process.env.DAY)
    {
        res.render('stats', {stats: JSON.parse(req.signedCookies.stats)});
    }
    else if (process.env.DAY > '0')
    {
        var onGetStats = function (err, doc)
        {
            if (err)
            {
                res.status(422);
                res.send('Error loading stats');
            }
            else
            {
                doc.overs = parseInt(doc.overs / 6, 10) + '.' + (doc.overs % 6);
                res.cookie('day', process.env.DAY, {signed : true, maxAge : 86400000});
                res.cookie('stats', JSON.stringify(doc), {signed : true, maxAge : 86400000});
                res.json(doc);
            }
        };

        mongoFeatures.getStats(onGetStats);
    }
    else
    {
        res.status(422);
        res.redirect('/home');
    }
});

router.get('/dashboard', apiFilter, function(req, res){
    if(req.signedCookies.dash && req.signedCookies.day === process.env.DAY)
    {
        res.json(JSON.parse(req.signedCookies.dash));
    }
    else if (process.env.DAY > '0')
    {
        credentials =
        {
            _id: req.signedCookies.name
        };

        var onFind = function (err, doc)
        {
            if (err)
            {
                res.status(422);
                req.flash('Error loading dashboard.');
            }
            else
            {
                res.cookie('day', process.env.DAY, {signed: true, maxAge: 86400000});
                res.cookie('dash', JSON.stringify(doc), {signed: true, maxAge: 86400000});
                res.json(doc);
            }
        };

        mongoTeam.dashboard(credentials, onFind);
    }
    else
    {
        res.status(422);
        res.send('The dashboard will be populated when matches begin.');
    }
});

module.exports = router;
