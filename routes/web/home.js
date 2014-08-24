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
var router = express.Router();

var mongoPlayers = require(path.join(__dirname, '..', '..', 'db', 'mongo-players'));
var mongoUsers = require(path.join(__dirname, '..', '..', 'db', 'mongo-users'));
var mongoTeam = require(path.join(__dirname, '..', '..', 'db', 'mongo-team'));
var mongoMatches = require(path.join(__dirname,'..','..','db','mongo-matches'));

router.get('/', function (req, res)
{
    if (req.signedCookies.name)
    {
        var credentials = {
            '_id': req.signedCookies.name
        };
        var onFetch = function (err, doc)
        {
            if (err)
            {
                res.redirect('/');
            }
            else if (doc)
            {
                res.render('home', {name: doc['_id']}); // What else does home.ejs want?
            }
            else
            {
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



router.get('/matches', function (req, res)
{
    if (req.cookies.name)
    {
        var teamName = req.signedCookie.name;

        var credentials1 = {
            'Team_1' : teamName
        };
        var credentials2 = {
            'Team_2' : teamName
        };
        var parallel_tasks = {};
        var response=[];
        var previousMatch = function(err,doc)
        {
            if(err)
            {
                // do something to the error
            }
            else
            {
                response.push(doc);
            }

        };

        parallel_tasks.team1=function(asyncCallback)
        {
            mongoMatches.fetchPreviousMatch(credentials1, asyncCallback);
        };
        parallel_tasks.team2=function(asyncCallback)
        {
            mongoMatches.fetchPreviousMatch(credentials2, asyncCallback);
        };
        async.parallel(parallel_tasks,previousMatch);

        parallel_tasks.team1 = function(asyncCallback)
        {
            mongoMatches.fetchNextMatch(credentials1, asyncCallback);
        };


        parallel_tasks.team2 = function(asyncCallback)
        {
            mongoMatches.fetchNextMatch(credentials2, asyncCallback);

        };
        var onFinish = function(err,results)
        {
            if(err)
            {
                // Add Response
            }
            else if(results.team1)
            {
                response.push(results.team1);

                res.render('matches', {Match : response });
            }
            else
            {
                response.push(results.team2);
                res.render('matches', {Match : response });
            }
        };
        async.parallel(parallel_tasks,onFinish);
    }
    else
    {
        res.redirect('/');
    }
});



router.get('/players', function (req, res) // page for all players, only available if no squad has been chosen
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
});


module.exports = router;
