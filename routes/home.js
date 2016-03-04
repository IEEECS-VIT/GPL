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
var log;
var cost;
var team;
var squad;
var stats;
var fields;
var players;
var ref =
{
    'users' : 1,
    'round2' : 2,
    'round3' : 3
};
var credentials;
var async = require('async');
var path = require('path').join;
var router = require('express').Router();
var authenticated = function(req, res, next)
{
    if(req.signedCookies.name || req.signedCookies.admin)
    {
        next();
    }
    else
    {
        res.redirect('/login');
    }
};
var mongoTeam = require(path(__dirname, '..', 'db', 'mongoTeam'));
var mongoUsers = require(path(__dirname, '..', 'db', 'mongoUsers'));
var mongoFeatures = require(path(__dirname, '..', 'db', 'mongoFeatures'));

if (process.env.LOGENTRIES_TOKEN)
{
    log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}

router.get('/', authenticated, function (req, res){
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
                        doc.balls_for = parseInt(doc.balls_for / 6, 10) + '.' + (doc.balls_for % 6);
                        doc.balls_against = parseInt(doc.balls_against / 6, 10) + '.' + (doc.balls_against % 6);
                        res.render('home', {results: {team: documents, user: doc, msg: req.flash()}});
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

router.get('/leaderboard', authenticated, function (req, res){
    if(req.signedCookies.lead && req.signedCookies.day === process.env.DAY)
    {
        res.render("leaderboard", {leaderboard: JSON.parse(req.signedCookies.lead)});
    }
    else if (process.env.DAY > '0'|| !process.env.NODE_ENV)                           // if cookie exists then access the database
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
                res.render("leaderboard", {leaderboard: documents});
            }
        };

        mongoUsers.getLeader(req.signedCookies.name, onFetch);
    }
    else
    {
        res.redirect('/home');
    }
});

router.get('/matches', authenticated, function (req, res){ // Deprecated
    if (process.env.DAY > '0') // Initialize process.env.DAY with -1, set to zero to open registrations.
    {
        credentials =
        {
            '_id' : req.signedCookies.name
        };

        var onMap = function (err, num)
        {
            if (err)
            {
                console.error(err.message);
                req.flash('Error fetching match details, please retry.');
                res.redirect('/home');
            }
            else
            {
                var onMatches = function (err, matches)
                {
                    if (err)
                    {
                        console.error(err.message);
                        req.flash('Error fetching match details, please retry.');
                        res.redirect('/home');
                    }
                    else
                    {
                        res.cookie('day', process.env.DAY, {signed : true, maxAge : 86400000});
                        res.render('matches', {match: matches || [], day : (process.env.DAY - 1) || 0, round : ref[process.env.MATCH]});
                    }
                };

                mongoTeam.fetchMatches(num, onMatches);
            }
        };

        mongoTeam.map(credentials, onMap);
    }
    else
    {
        res.redirect('/home');
    }
});

router.get('/match/:day', authenticated, function(req, res){
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
                          res.render('match', {match: match || {}, day : (process.env.DAY - 1) || 0, round : ref[process.env.MATCH]});
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

router.post('/getsquad', authenticated, function (req, res) {
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

router.post('/players', function (req, res){
    stats = {};
    players = [];
    fields =
    {
        Cost: 1
    };
    cost = 10000000;
    credentials =
    {
        _id: req.signedCookies.name
    };

    for (i = 1; i < 17; ++i)
    {
        players.push(req.body['p' + i]);
    }

    var onUpdate = function (err)
    {
        if (err)
        {
            req.flash('Your squad was not updated, please re-try.');
            res.redirect('/home/players');
        }
        else
        {
            res.redirect('/home/team');
        }
    };

    var getCost = function (id, callback)
    {
        if (id < 'd')
        {
            stats[id]         = {};
            stats[id].MoM     = 0;
            stats[id].form    = 0;
            stats[id].morale  = 0;
            stats[id].points  = 0;
            stats[id].fatigue = 0;
            stats[id].matches = 0;
            stats[id].catches = 0;

            if (!(id > 'b' && id < 'c'))
            {
                stats[id].outs        = 0;
                stats[id].balls       = 0;
                stats[id].high        = -1;
                stats[id].fours       = 0;
                stats[id].sixes       = 0;
                stats[id].recent      = [];
                stats[id].notouts     = 0;
                stats[id].average     = 0.0;
                stats[id].runsScored = 0;
                stats[id].strikeRate = 0.0;
                stats[id].low         = Number.MAX_VALUE;
            }
            if (id > 'b')
            {
                stats[id].sr            = 0.0;
                stats[id].overs         = 0;
                stats[id].avg           = 0.0;
                stats[id].economy       = 0.0;
                stats[id].runsGiven    = 0;
                stats[id].wicketsTaken = 0;
            }
        }

        mongoFeatures.getPlayer(id, fields, callback);
    };

    var onFinish = function (err, documents)
    {
        if (err)
        {
            req.flash('Error creating team record.');
            res.redirect('/home');
        }
        else
        {
            var reduction = function(arg, callback)
            {
                cost -= parseInt(arg.Cost, 10);
                callback();
            };
            var onReduce = function(err)
            {
                if(err)
                {
                    req.flash('An unexpected error occurred, please re-try.');
                    res.redirect('/players');
                }
                else if(cost < 0)
                {
                    req.flash('Cost exceeded!');
                    res.redirect('/home/players');
                }
                else
                {
                    mongoUsers.updateUserTeam(credentials, players, stats, cost, onUpdate);
                }
            };

            async.each(documents, reduction, onReduce);
        }
    };

    async.map(players, getCost, onFinish);
});

/*
router.get('/sponsors', function (req, res){ // sponsors page TODO: Sponsor hunt ;)
    res.render('sponsors');
});
*/

router.get(/\/prizes?/, function (req, res){ // page to view prizes
    res.render('prizes');
});

router.get('/players', authenticated, function (req, res, next){ // page for all players, only available if no squad has been chosen
    credentials =
    {
        "_id": req.signedCookies.name
    };

    var onFetchUser = function (err, document)
    {
        if (err)
        {
            res.status(422);
            next(err);
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
                        res.status(422);
                        next(err);
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
                                next(err);
                            }
                            else
                            {
                                res.render('players', {Players: result, csrfToken: req.csrfToken(), msg: req.flash()});
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

router.get('/team', authenticated, function (req, res, next){ // view the assigned playing 11 with options to change the playing 11
    credentials =
    {
        '_id': req.signedCookies.name
    };

    var getTeam = function (err, documents)
    {
        if (err)
        {
            res.status(422);
            next(err);
        }
        else
        {
            res.render('team', {Squad: documents, csrfToken: req.csrfToken()});
        }
    };

    mongoTeam.getTeam(credentials, getTeam);
});

router.get('/stats', authenticated, function (req, res, next){
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
                next(err);
            }
            else
            {
                doc.overs = parseInt(doc.overs / 6, 10) + '.' + (doc.overs % 6);
                res.cookie('day', process.env.DAY, {signed : true, maxAge : 86400000});
                res.cookie('stats', JSON.stringify(doc), {signed : true, maxAge : 86400000});
                res.render('stats', {stats: doc});
            }
        };

        mongoFeatures.getStats(onGetStats);
    }
    else
    {
        res.redirect('/home');
    }
});

router.get('/feature', authenticated, function (req, res){
    res.render('feature', {csrfToken: req.csrfToken()});
});

router.post('/feature', authenticated, function (req, res, next){
    var onInsert = function (err)
    {
        if (err)
        {
            res.status(422);
            next(err);
        }

        res.redirect('/home');
    };

    mongoUsers.insert('features', {user : req.signedCookies.name, features: req.body.feature}, onInsert);
});

router.get('/dashboard', authenticated, function (req, res, next){
    if(req.signedCookies.dash && req.signedCookies.day === process.env.DAY)
    {
        res.render('dashboard', {result : JSON.parse(req.signedCookies.dash)});
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
                next(err);
            }
            else
            {
                res.cookie('day', process.env.DAY, {signed: true, maxAge: 86400000});
                res.cookie('dash', JSON.stringify(doc), {signed: true, maxAge: 86400000});
                res.render('dashboard', {result: doc});
            }
        };

        mongoTeam.dashboard(credentials, onFind);
    }
    else
    {
        res.redirect('/home');
    }
});

router.get('/settings', authenticated, function(req, res){
    res.render('settings', {csrfToken : req.csrfToken()});
});

module.exports = router;
