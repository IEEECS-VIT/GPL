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

var async = require('async');
var path = require('path').join;
var router = require('express').Router();
var mongoTeam = require(path(__dirname, '..', 'db', 'mongo-team'));
var mongoUsers = require(path(__dirname, '..', 'db', 'mongo-users'));
var mongoFeatures = require(path(__dirname, '..', 'db', 'mongo-features'));
var apiFilter = function(req, res, next)
{
    if(req.headers.referer && req.signedCookies.name && req.headers.host === req.headers.referer.split('/')[2] && req.route.path === req.url)
    {
        next();
    }
    else
    {
        res.redirect('/');
    }
};

router.get('/check/:name', function(req, res){
    if(req.headers.referer && !req.signedCookies.name && req.headers.host === req.headers.referer.split('/')[2] && req.url.match(/^\/(social\/)?register$/))
    {
        mongoUsers.fetchUser({_id: req.params.name.trim().toUpperCase()}, function(err, user){
            res.send(!user);
        });
    }
    else
    {
        res.redirect('/');
    }
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
            res.redirect('/home');
        }
        else if (doc)
        {
            if (!doc.team.length)
            {
                res.redirect('/home/players');
            }
            else if(!doc.squad.length)
            {
                res.redirect('/home/team');
            }
            else
            {
                var onFinish = function (err, documents)
                {
                    if (err)
                    {
                        res.redirect('/home');
                    }
                    else
                    {
                        doc.balls_for = parseInt(doc.balls_for / 6) + '.' + (doc.balls_for % 6);
                        doc.balls_against = parseInt(doc.balls_against / 6) + '.' + (doc.balls_against % 6);
                        res.json({team: documents, user: doc});
                    }
                };

                async.map(doc.team, mongoFeatures.getPlayer, onFinish);
            }
        }
        else
        {
            res.clearCookie('name', {});
            res.redirect('/login');
        }
    };

    mongoUsers.fetchUser(credentials, onFetch);
});

router.get('/leaderboard', apiFilter, function(req, res){
    if(req.signedCookies.lead && req.signedCookies.day == process.env.DAY)
    {
        res.render("leaderboard", {leaderboard: JSON.parse(req.signedCookies.lead)});
    }
    else if (process.env.DAY >= '1'|| !process.env.NODE_ENV) // if cookie exists then access the database
    {
        var onFetch = function (err, documents)
        {
            if (err)
            {
                console.error(err.message);
                req.flash('Unable to process the leaderboard at this time, please re-try');
                res.redirect('/home');
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
        res.redirect('/home');
    }
});

router.get('/match/:day', apiFilter, function(req, res){
    if(process.env.DAY >= '0' && req.params.day >= '1' && req.params.day <= '7')
    {
        credentials =
        {
            '_id' : req.signedCookies.name
        };

        var onMap = function (err, num)
        {
            if (err)
            {
                req.flash('Error loading match ' + req.params.day + 'details.');
                res.redirect('/home');
            }
            else
            {
                var onMatch = function (err, match)
                {
                    if (err)
                    {
                        req.flash('Error loading match ' + req.params.day + 'details.');
                        res.redirect('/home');
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
        res.redirect('/home');
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
            req.flash('That request encountered an error, please re-try.');
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
            req.flash('That request encountered an error, please re-try.');
            res.redirect('/home');
        }
        else
        {
            if (document.team.length)
            {
                if (!document.squad.length)
                {
                    res.redirect("/home/team");
                }
                else
                {
                    res.redirect("/home");
                }
            }
            else
            {
                var onFetch = function (err, documents)
                {
                    if (err)
                    {
                        req.flash('Error loading player data.');
                        res.redirect('/home');
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
                                res.redirect('/players');
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
            req.flash('Error loading team data.');
            res.redirect('/home');
        }
        else
        {
            res.json({Squad: documents, csrfToken: req.csrfToken()});
        }
    };

    mongoTeam.getTeam(credentials, getTeam);
});

router.get('/stats', apiFilter, function(req, res){
    if(req.signedCookies.stats && req.signedCookies.day == process.env.DAY)
    {
        res.render('stats', {stats: JSON.parse(req.signedCookies.stats)});
    }
    else if (process.env.DAY >= '1')
    {
        var onGetStats = function (err, doc)
        {
            if (err)
            {
                req.flash('Error loading stats');
                res.redirect('/home');
            }
            else
            {
                doc.overs = parseInt(doc.overs / 6) + '.' + (doc.overs % 6);
                res.cookie('day', process.env.DAY, {signed : true, maxAge : 86400000});
                res.cookie('stats', JSON.stringify(doc), {signed : true, maxAge : 86400000});
                res.json(doc);
            }
        };

        mongoFeatures.getStats(onGetStats);
    }
    else
    {
        res.redirect('/home');
    }
});

router.get('/dashboard', apiFilter, function(req, res){
    if(req.signedCookies.dash && req.signedCookies.day == process.env.DAY)
    {
        res.render('dashboard', {result : JSON.parse(req.signedCookies.dash)});
    }
    else if (process.env.DAY >= '1')
    {
        credentials =
        {
            _id: req.signedCookies.name
        };

        var onFind = function (err, doc)
        {
            if (err)
            {
                req.flash('Error loading dashboard.');
                res.redirect('/home');
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
        res.redirect('/home');
    }
});

module.exports = router;
