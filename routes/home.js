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
var temp;
var path = require('path');
var async = require('async');
var router = require('express').Router();
var mongoTeam = require(path.join(__dirname, '..', 'db', 'mongo-team.js'));
var mongoUsers = require(path.join(__dirname, '..', 'db', 'mongo-users.js'));
var match = require(path.join(__dirname, '..', 'schedule', 'matchCollection'));
var mongoPlayers = require(path.join(__dirname, '..', 'db', 'mongo-players.js'));
var mongoFeatures = require(path.join(__dirname, '..', 'db', 'mongo-features.js'));

if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

router.get('/', function (req, res) {
    var results = {};
    if (req.signedCookies.name)
    {
        var credentials =
        {
            '_id': req.signedCookies.name
        };
        var onFetch = function (err, doc)
        {
            if (err)
            {
                console.log(err);
            }
            else if (doc)
            {
                results.user = doc;
                if (doc.team.length === 0)
                {
                    res.redirect('/home/players');
                }

                var getDetails = function (id, callback)
                {
                    var player =
                    {
                        '_id': id
                    };
                    var fields =
                    {
                        _id: 1,
                        Name: 1,
                        Cost: 1,
                        Country: 1,
                        Type: 1
                    };
                    mongoPlayers.getPlayer(player, fields, callback)
                };

                var onFinish = function (err, documents)
                {
                    if (err)
                    {
                        console.log(err.message);
                    }
                    else
                    {
                        results.team = documents;
                        res.render('home', {results: results});
                    }
                };

                if (err)
                {
                    res.redirect('/');
                }
                else
                {
                    var document = doc.team;
                    async.map(document, getDetails, onFinish);
                }
            }
            else
            {
                res.clearCookie('name', {});
                res.redirect('/');
            }
        };
        mongoUsers.fetch(credentials, onFetch);
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/leaderboard', function (req, res) {    // Leaderboard/Standings
    if (req.signedCookies.lead)
    {
        res.render("leaderboard", {leaderboard: req.signedCookies.lead});
    }
    else if (req.signedCookies.name)                           // if cookies exists then access the database
    {
        var onFetch = function (err, documents)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                time = new Date;
                time.setTime(time.getTime() + time.getTimezoneOffset() * 60000 + 19800000);
                temp = new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1);
                res.cookie('lead', documents, {maxAge: temp.getTime() - time.getTime(), signed: true});
                res.render("leaderboard", {leaderboard: documents, name: req.signedCookies.name._id});
            }
        };
        mongoUsers.getLeader(req.signedCookies.name, onFetch);
    }
    else
    {
        res.redirect("/");
    }
});

router.get('/matches', function (req, res) {
    /*if (req.signedCookies.name && process.env.LIVE === '1')
    {
        var onMap = function (err, num)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                var onMatches = function (err, matches)
                {
                    if (err)
                    {
                        console.log(err.message);
                    }
                    else
                    {
                        res.render('matches', {match: matches});
                    }
                };
                mongoTeam.fetchMatches(num, onMatches);
            }
        };
        mongoTeam.map({_id: req.signedCookies.name}, onMap);
    }
    else*/
    {
        res.redirect('/');
    }
});

router.post('/getsquad', function (req, res) {
    if (req.signedCookies.name)
    {
        var teamname = req.signedCookies.name;
        var credentials =
        {
            '_id': teamname
        };
        var squad = [];
        for (i = 1; i < 12; ++i)
        {
            squad.push(req.body['p' + i]);
        }
        var onFetch = function (err, document)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(document);
                res.redirect('/home');
            }
        };
        mongoUsers.updateMatchSquad(credentials, squad, onFetch);
    }
    else
    {
        req.session.route = 'squad';
        res.redirect('/');
    }
});

router.post('/getTeam', function (req, res) {
    var players = [], cost = 0;
    for (i = 2; i < 17; ++i)
    {
        players.push(req.body['p' + i]);
    }
    players.push(req.body.p1);
    console.log(players);
    var onUpdate = function (err, documents)
    {
        if (err)
        {
            console.log(err.message);
        }
        else
        {
            console.log(documents);
            res.redirect('/home');
        }
    };

    var getCost = function (id, callback)
    {
        var fields =
        {
            _id: 1,
            Name: 1,
            Cost: 1,
            Country: 1,
            Type: 1
        };
        var player =
        {
            _id: id
        };
        mongoPlayers.getPlayer(player, fields, callback)
    };

    var onFinish = function (err, documents)
    {
        if (err)
        {
            console.log(err.message);
        }
        else
        {
            console.log(documents);
            for (var i = parseInt(0); i < documents.length; i++)
            {
                cost += documents[i].Cost;
                if (cost > 10000000)
                {
                    res.redirect('/home/players', {err: "Cost Exceeded"});
                }
            }
            res.redirect('/home/team');
        }
    };

    async.map(players, getCost, onFinish);

    var teamName = req.signedCookies.name;
    var credentials =
    {
        _id: teamName
    };
    var stats = {};
    for (i = 0; i < players.length; ++i)
    {
        if (players[i] > 'd')
        {
            continue;
        }
        stats[players[i]] = {};
        stats[players[i]].MoM = 0;
        stats[players[i]].form = 0;
        stats[players[i]].morale = 0;
        stats[players[i]].fatigue = 0;
        stats[players[i]].matches = 0;
        stats[players[i]].catches = 0;
        if (!(players[i] > 'b' && players[i] < 'c'))
        {
            stats[players[i]].outs = 0;
            stats[players[i]].balls = 0;
            stats[players[i]].high = -1;
            stats[players[i]].fours = 0;
            stats[players[i]].sixes = 0;
            stats[players[i]].recent = [];
            stats[players[i]].notouts = 0;
            stats[players[i]].average = 0.0;
            stats[players[i]].runs_scored = 0;
            stats[players[i]].strike_rate = 0.0;
            stats[players[i]].low = Number.MAX_VALUE;
        }
        if (players[i] > 'b' && players[i] < 'd')
        {
            stats[players[i]].sr = 0.0;
            stats[players[i]].overs = 0;
            stats[players[i]].avg = 0.0;
            stats[players[i]].economy = 0.0;
            stats[players[i]].runs_given = 0;
            stats[players[i]].wickets_taken = 0;
        }
    }
    mongoUsers.updateUserTeam(credentials, players, stats, cost, onUpdate);
});

/*router.get('/sponsors', function (req, res) // sponsors page
 {
 res.render('sponsors');
 });*/

router.get(/\/prizes?/, function (req, res) // page to view prizes
{
    res.render('prizes');
});


router.get('/players', function (req, res) // page for all players, only available if no squad has been chosen
{
    if (req.signedCookies.name)
    {
        var doc =
        {
            "_id": req.signedCookies.name
        };
        var onFetchUser = function (err, document)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                if (document.team.length != 0)
                {
                    res.redirect("/home");
                }
                else
                {
                    var onFetch = function (err, documents)
                    {
                        if (err)
                        {
                            res.redirect('/home');
                        }
                        else
                        {
                            res.render('players', {Players: documents, csrfToken: req.csrfToken()});
                        }
                    };
                    mongoPlayers.fetchPlayers(onFetch);
                }
            }
        };
        mongoUsers.fetch(doc, onFetchUser);
    }
    else
    {
        req.session.route = 'player';
        res.redirect("/");
    }
});

router.get('/team', function (req, res) // view the assigned playing 11 with options to change the playing 11
{
    if (req.signedCookies.name)                           // if cookies exist, then access the database
    {
        var credentials =
        {
            '_id': req.signedCookies.name
        };

        var getTeam = function (err, documents)
        {
            if (err)
            {
                console.log(err.message);
                res.redirect('/home');
            }
            else
            {
                res.render('team', {Squad: documents, csrfToken: req.csrfToken()});
            }
        };
        mongoTeam.getTeam(credentials, getTeam);
    }
    else                                                        // if cookies do not exist, go to login page
    {
        req.session.route = 'team';
        res.redirect('/');
    }
});

router.get('/info', function (req, res) {
    if (req.signedCookies.name)
    {
        if (req.signedCookies.info)
        {
            res.render('info', {info: req.signedCookies.info});
        }
        else
        {
            var onGetInfo = function (err, doc)
            {
                if (err)
                {
                    console.log(err.message);
                    res.redirect('/');
                }
                else
                {
                    res.cookie('info', doc, {maxAge: 86400000, signed: true});
                    res.render('info', {info: doc});
                }
            };
            mongoFeatures.getInfo(onGetInfo);
        }
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/feature', function (req, res) {
    if (req.signedCookies.name)
    {
        res.render('feature', {csrfToken: req.csrfToken()});
    }
    else
    {
        res.redirect('/');
    }
});

router.post('/feature', function (req, res) {
    if (req.signedCookies.name)
    {
        var feature =
        {
            teamName: req.signedCookies.name,
            name: req.body.f_name,
            email: req.body.f_email,
            features: req.body.f_requests
        };
        var onInsert = function (err, docs)
        {
            if (err)
            {
                console.log(err);
            }
            else
            {
                console.log(docs);
                res.redirect('/home');
            }
        };
        mongoFeatures.insert(feature, onInsert);
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/dashboard', function (req, res) {
    if (req.signedCookies.name || 1)
    {
        var user =
        {
            _id: req.signedCookies.name || 'team_05'
        };
        var onFind = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(doc);
                res.render('dashboard', {result: doc});
            }
        };
        mongoTeam.dashboard(user, onFind);
    }
    else
    {
        res.redirect('/');
    }
});

module.exports = router;