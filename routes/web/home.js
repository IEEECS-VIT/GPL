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

var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var mongoPlayers = require(path.join(__dirname, '..', '..', 'db', 'mongo-players.js'));
var mongoUsers = require(path.join(__dirname, '..', '..', 'db', 'mongo-users.js'));
var mongoTeam = require(path.join(__dirname, '..', '..', 'db', 'mongo-team.js'));
var mongoMatches = require(path.join(__dirname, '..', '..', 'db', 'mongo-matches.js'));


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
                        //do something with the error
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
        var teamname = req.signedCookies.name;
        var doc =
        {
            "_id": teamname
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
                        //console.log(response.previousMatch);
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
                //res.render('matches', response);

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
        var squad1 = parseInt(req.body.p1);
        var squad2 = parseInt(req.body.p2);
        var squad3 = parseInt(req.body.p3);
        var squad4 = parseInt(req.body.p4);
        var squad5 = parseInt(req.body.p5);
        var squad6 = parseInt(req.body.p6);
        var squad7 = parseInt(req.body.p7);
        var squad8 = parseInt(req.body.p8);
        var squad9 = parseInt(req.body.p9);
        var squad10 = parseInt(req.body.p10);
        var squad11 = parseInt(req.body.p11);
        console.log(squad11);
        squad.push(squad1);
        squad.push(squad2);
        squad.push(squad3);
        squad.push(squad4);
        squad.push(squad5);
        squad.push(squad6);
        squad.push(squad7);
        squad.push(squad8);
        squad.push(squad9);
        squad.push(squad10);
        squad.push(squad11);
        console.log(squad);
        var onFetch = function (err, document)
        {
            if (err)
            {
                console.log(err.message);
                //do something with the error
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
    var player1 = parseInt(req.body.p1);
    var player2 = parseInt(req.body.p2);
    var player3 = parseInt(req.body.p3);
    var player4 = parseInt(req.body.p4);
    var player5 = parseInt(req.body.p5);
    var player6 = parseInt(req.body.p6);
    var player7 = parseInt(req.body.p7);
    var player8 = parseInt(req.body.p8);
    var player9 = parseInt(req.body.p9);
    var player10 = parseInt(req.body.p10);
    var player11 = parseInt(req.body.p11);
    var player12 = parseInt(req.body.p12);
    var player13 = parseInt(req.body.p13);
    var player14 = parseInt(req.body.p14);
    var player15 = parseInt(req.body.p15);
    var player16 = parseInt(req.body.p16);
    players.push(player1);
    players.push(player2);
    players.push(player3);
    players.push(player4);
    players.push(player5);
    players.push(player6);
    players.push(player7);
    players.push(player8);
    players.push(player9);
    players.push(player10);
    players.push(player11);
    players.push(player12);
    players.push(player13);
    players.push(player14);
    players.push(player15);
    players.push(player16);

    var onUpdate = function (err, documents)
    {
        if (err)
        {
            // do something with the error
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
            // do something with the error
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
        stats[players[i]]._id = players[i];
        stats[players[i]].matches = 0;
        stats[players[i]].catches = 0;
        stats[players[i]].MoM = 0;
        if((players[i] > 'a' && players[i] < 'b') || (players[i] > 'c' && players[i] < 'd'))
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
        if(players[i] > 'b' && players[i] < 'c')
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


router.get('/rules', function (req, res)
{
    res.render('rules', { });
});
router.get('/rules', function (req, res)
{
    res.render('rules', { });
});
router.get('/sponsors', function (req, res) // sponsors page
{
    res.render('sponsors', { });
});
router.get('/prize', function (req, res) // page to view prizes
{
    res.render('prize', { });
});
router.get('/trailer', function (req, res) // trailer page
{
    res.render('trailer', { });
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
                //do something with the error
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
    if (req.signedCookies.name)                           // if cookies exists then access the database
    {
        var teamName = req.signedCookies.name;
        var credentials =
        {
            '_id': teamName
        };

        var getTeam = function (err, documents)
        {
            if (err)
            {
                res.redirect('/home');
            }
            else
            {
                res.render('team', {Squad: documents});
            }

        };
        mongoTeam.getTeam(credentials, getTeam);
    }
    else                                                        // if cookies does not exists , go to login page
    {
        res.redirect('/');
    }
});
router.get('/developers', function (req, res) // developers page
{

    res.render('developers', {});
});
module.exports = router;
