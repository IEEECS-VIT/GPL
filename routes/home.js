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

var express = require('express');
var path = require('path');
var async = require('async');
var router = express.Router();
var match = require(path.join(__dirname, '..', 'matchCollection'));
var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var mongoPlayers = require(path.join(__dirname, '..', 'db', 'mongo-players.js'));
var mongoUsers = require(path.join(__dirname, '..', 'db', 'mongo-users.js'));
var mongoTeam = require(path.join(__dirname, '..', 'db', 'mongo-team.js'));
var mongoMatches = require(path.join(__dirname, '..', 'db', 'mongo-matches.js'));


router.get('/', function (req, res)
{
    var results = {};
    if (req.signedCookies.name)
    {
        var credentials = {
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
                if (doc.team.length == 0)
                {
                    res.redirect("/home/players")
                }

                var getDetails = function (id, callback)
                {
                    var player =
                    {
                        '_id': id
                    };
                    var fields =
                    {
                        _id : 1,
                        Name : 1,
                        Cost : 1,
                        Country : 1,
                        Type : 1
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
                res.clearCookie('name', { });
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

router.get('/leaderboard', function (req, res) // Leaderboard/Standings
{
    if (req.signedCookies.name)                           // if cookies exists then access the database
    {
        var doc =
        {
            "_id": req.signedCookies.name
        };
        var onFetch = function (err, documents)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(documents);
                res.render("leaderboard", { leaderboard: documents});
            }
        };
        console.log("get Leader Function");
        mongoUsers.getleader(doc, onFetch);
    }
    else
    {
        res.redirect("/");
    }
});

router.get('/matches', function (req, res)
{
    if (req.signedCookies.name)
    {
        var teamName = req.signedCookies.name;

        var credentials = {
            '_id':teamName
        };
        var onFetch = function(err,doc)
        {
            if(err)
            {
                if(log)
                {
                    if (log) log.log('debug', {Error: err, Message: err.message});
                }
            }
            else
            {
                var credentials1 = {
                    'Team_1': doc.team_no
                };
                var credentials2 = {
                    'Team_2': doc.team_no
                };
                var parallel_tasks = {};
                var response = {};
                response.test = "False";
                var onFinish = function (err, results)
                {
                    if (err)
                    {
                        if (log) log.log('debug', {Error: err, Message: err.message});
                    }
                    else
                    {
                        response["previousMatch"] = results.previousMatch;
                        response["nextMatch"] = results.nextMatch;

                        if (response["previousMatch"] != null || response["nextMatch"] != null)
                        {
                            response.test = "True";
                        }
                        console.log(response.nextMatch);
                        res.render('matches', {response: response});
                    }
                };

                parallel_tasks.previousMatch = function (asyncCallback)
                {
                    mongoMatches.fetchPreviousMatch(credentials1, credentials2, asyncCallback);
                };
                parallel_tasks.nextMatch = function (asyncCallback)
                {
                    mongoMatches.fetchNextMatch(credentials1, credentials2, asyncCallback);

                };
                async.parallel(parallel_tasks, onFinish);
            }
        };
        mongoUsers.fetch(credentials,onFetch);
    }
    else
    {
        res.redirect('/');
    }
});

router.post('/getsquad', function (req, res)
{
    if (req.signedCookies.name)
    {
        var teamname = req.signedCookies.name;
        var credentials = {
            '_id': teamname
        };
        var squad = [];
        squad.push(parseInt(req.body.p1));
        squad.push(parseInt(req.body.p2));
        squad.push(parseInt(req.body.p3));
        squad.push(parseInt(req.body.p4));
        squad.push(parseInt(req.body.p5));
        squad.push(parseInt(req.body.p6));
        squad.push(parseInt(req.body.p7));
        squad.push(parseInt(req.body.p8));
        squad.push(parseInt(req.body.p9));
        squad.push(parseInt(req.body.p10));
        squad.push(parseInt(req.body.p11));
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
        mongoUsers.updateUserSquad(credentials, squad, onFetch);
    }
    else
    {
        res.redirect('/');
    }
});

router.post('/getTeam', function (req, res)
{
    var players = [], cost = 0;
    players.push(parseInt(req.body.p1));
    players.push(parseInt(req.body.p2));
    players.push(parseInt(req.body.p3));
    players.push(parseInt(req.body.p4));
    players.push(parseInt(req.body.p5));
    players.push(parseInt(req.body.p6));
    players.push(parseInt(req.body.p7));
    players.push(parseInt(req.body.p8));
    players.push(parseInt(req.body.p9));
    players.push(parseInt(req.body.p10));
    players.push(parseInt(req.body.p11));
    players.push(parseInt(req.body.p12));
    players.push(parseInt(req.body.p13));
    players.push(parseInt(req.body.p14));
    players.push(parseInt(req.body.p15));
    players.push(parseInt(req.body.p16));

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
        var fields = {
            _id: 1,
            Name: 1,
            Cost: 1,
            Country: 1,
            Type: 1
        };
        var player = {
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
    for(i in players)
    {
        if(players[i] > 'd')
        {
            continue;
        }
        stats[players[i]] = {};
        stats[players[i]].matches = 0;
        stats[players[i]].catches = 0;
        stats[players[i]].MoM = 0;
        if(!(players[i] > 'b' && players[i] < 'c'))
        {
            stats[players[i]].runs_scored = 0;
            stats[players[i]].balls = 0;
            stats[players[i]].outs = 0;
            stats[players[i]].notouts = 0;
            stats[players[i]].strike_rate = 0.0;
            stats[players[i]].average = 0.0;
            stats[players[i]].high = -1;
            stats[players[i]].low = Number.MAX_VALUE;
            stats[players[i]].fours = 0;
            stats[players[i]].sixes = 0;
            stats[players[i]].recent = [];
        }
        if(players[i] > 'b' && players[i] < 'd')
        {
            stats[players[i]].runs_given = 0;
            stats[players[i]].wickets_taken = 0;
            stats[players[i]].economy = 0.0;
            stats[players[i]].overs = 0;
            stats[players[i]].avg = 0.0;
            stats[players[i]].sr = 0.0;
        }
    }
        mongoUsers.updateUserTeam(credentials, players, stats, onUpdate);
});

router.get('/forgot', function(req, res){
   res.render('forgot', {csrfToken : req.csrfToken()});
});

router.get('/reset/:token', function(req, res){
    var onGetReset = function(err, doc)
    {
        if(err)
        {
            console.log(err.message);
        }
        else if(!doc)
        {
            res.redirect('/forgot');
        }
        else
        {
            res.render('reset', {csrfToken : req.csrfToken()});
        }
    };
    mongoUsers.getReset({token: req.params.token, expire: {$gt: Date.now()}}, onGetReset);
});

router.get('/rules', function (req, res)
{
    res.render('rules');
});

router.get('/sponsors', function (req, res) // sponsors page
{
    res.render('sponsors');
});

router.get('/prize', function (req, res) // page to view prizes
{
    res.render('prize');
});

router.get('/trailer', function (req, res) // trailer page
{
    res.render('trailer');
});

router.get('/players', function (req, res) // page for all players, only available if no squad has been chosen
{
    if (req.signedCookies.name)
    {
        var doc = {
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
                            res.render('players', {
                                Players: documents
                            });
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
                res.render('team', {Squad: documents});
            }

        };
        mongoTeam.getTeam(credentials, getTeam);
    }
    else                                                        // if cookies does not exist, go to login page
    {
        res.redirect('/');
    }
});

router.get('/developers', function (req, res) // developers page
{
    res.render('developers');
});

module.exports = router;
