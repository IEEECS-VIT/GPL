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
var database;
var stats = {};
var points = 0;
var path = require('path');
var async = require('async');
var days = [1, 2, 3, 4, 5, 6, 7];
var MongoClient = require('mongodb').MongoClient;
var email = require(path.join(__dirname, 'email.js'));
var simulator = require(path.join(__dirname, 'simulation'));
var match = require(path.join(__dirname, '..', 'schedule', 'matchCollection'));
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/GPL';

if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}
var ref =
{
    'users': 1,
    'round2': 2,
    'round3': 3
};

var message = email.wrap({
    from: 'gravitaspremierleague@gmail.com',
    subject: 'Round ' + ref[match] + ', match ' + (process.env.DAY || 1) + ' results are out!'
});

message.attach_alternative("<table background='http://res.cloudinary.com/gpl/general/img7.jpg' align='center' cellpadding='0' cellspacing='0' width='600' style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
    "<tr><td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>graVITas Premier League</td>" +
    "</tr><tr><td align='center' style='padding: 40px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:x-large;'> This is to inform that the match results are out<br>" +
    "Please click <a href='http://gravitaspremierleague.com/home/matches' style='text-decoration: none;'>here </a> to view your scores.  </td>" +
    "</tr><tr><td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; font-weight: bold;'>Regards,<br>Team GPL<br>IEEE Computer Society<br>VIT Student chapter</td></tr></table>");

message.header.bcc = [];

var databaseOptions =
{
    server:
    {
        socketOptions:
        {
            keepAlive: 1,
            connectTimeoutMS: 30000
        },
        auto_reconnect: true,
        poolSize: 100
    }
};

exports.initSimulation = function (day, masterCallback)
{
    var forEachMatch = function (matchDoc, callback)
    {
        var parallelTasks =
        {
            team1: function (asyncCallback)
            {
                getTeamDetails({team_no: matchDoc.Team_1}, asyncCallback);
            },
            team2: function (asyncCallback)
            {
                getTeamDetails({team_no: matchDoc.Team_2}, asyncCallback);
            }
        };

        var getTeamDetails = function (query, asyncCallback)
        {
            var getRating = function (err, userDoc)
            {
                var getEachRating = function (elt, subCallback)
                {
                    database.collection('players').findOne({_id: elt}, subCallback);
                };

                var onGetRating = function (err, results)
                {
                    userDoc.ratings = results;
                    asyncCallback(err, userDoc);
                };

                if (userDoc.squad.length < 11)
                {
                    userDoc.ratings = [];
                    asyncCallback(err, userDoc);
                }
                else
                {
                    var addCoach = function (elt)
                    {
                        if (elt > 'd')
                        {
                            userDoc.squad.push(elt);
                        }
                    };
                    userDoc.team.forEach(addCoach);
                    async.map(userDoc.squad, getEachRating, onGetRating);
                }
            };
            database.collection(match).findOne(query, getRating);
        };

        var updateData = function (err, newData)
        {
            var updateUser = function (newUserDoc, asyncCallback)
            {
                stats.runs += newUserDoc.runs_for;
                stats.overs += newUserDoc.balls_for;
                stats.wickets += newUserDoc.wickets_lost;
                if(newUserDoc.highest_total > stats.high.total.value)
                {
                    stats.high.total.team = newUserDoc._id;
                    stats.high.total.value = newUserDoc.highest_total;
                }
                if(newUserDoc.lowest_total < stats.low.value)
                {
                    stats.low.team = newUserDoc._id;
                    stats.low.value = newUserDoc.lowest_total;
                }
                for (i = 0; i < newUserDoc.squad.length; ++i)
                {
                    stats.six += (newUserDoc.stats[newUserDoc.squad[i]].sixes || 0);
                    stats.four += (newUserDoc.stats[newUserDoc.squad[i]].fours || 0);
                    if (!newUserDoc.squad[i].match(/^b/))
                    {
                        if(newUserDoc.stats[newUserDoc.squad[i]].runs_scored > stats.high.score)
                        {
                            stats.high.score = newUserDoc.stats[newUserDoc.squad[i]].runs_scored;
                        }
                        if(newUserDoc.stats[newUserDoc.squad[i]].runs_scored > stats.orange.runs)
                        {
                            stats.orange.team = newUserDoc._id;
                            stats.orange.player = newUserDoc.squad[i];
                            stats.orange.avg = newUserDoc.stats[newUserDoc.squad[i]].average;
                            stats.orange.balls = newUserDoc.stats[newUserDoc.squad[i]].balls;
                            stats.orange.runs = newUserDoc.stats[newUserDoc.squad[i]].runs_scored;
                            stats.orange.sr = newUserDoc.stats[newUserDoc.squad[i]].bat_strike_rate;
                        }
                    }
                    if (newUserDoc.squad[i].match(/^[^a]/) && newUserDoc.stats[newUserDoc.squad[i]].wickets_taken > stats.purple.wickets)
                    {
                        stats.purple.team = newUserDoc._id;
                        stats.purple.player = newUserDoc.squad[i];
                        stats.purple.sr = newUserDoc.stats[newUserDoc.squad[i]].sr;
                        stats.purple.avg = newUserDoc.stats[newUserDoc.squad[i]].avg;
                        stats.purple.balls = newUserDoc.stats[newUserDoc.squad[i]].overs;
                        stats.purple.economy = newUserDoc.stats[newUserDoc.squad[i]].economy;
                        stats.purple.wickets = newUserDoc.stats[newUserDoc.squad[i]].wickets_taken;
                    }
                }
                database.collection(match).updateOne({_id: newUserDoc._id}, newUserDoc, function () {
                    message.header.bcc.push(newUserDoc.email);
                    asyncCallback();
                });
            };

            var updateMatch = function (newMatchDoc, asyncCallback)
            {
                if (newMatchDoc.MoM.points > points)
                {
                    stats.daily = newMatchDoc.MoM;
                    points = newMatchDoc.MoM.points;
                }
                database.collection('matchday' + day).updateOne({_id: newMatchDoc._id}, newMatchDoc, asyncCallback);
            };

            var parallelTasks2 =
                [
                    function (asyncCallback)
                    {
                        updateUser(newData.team1, asyncCallback);
                    },
                    function (asyncCallback)
                    {
                        updateUser(newData.team2, asyncCallback);
                    },
                    function (asyncCallback)
                    {
                        updateMatch(newData.match, asyncCallback);
                    }
                ];
            console.log(newData.team1._id + ' vs ' + newData.team2._id + ' (Match ' + newData.match._id + ') is now being updated');
            async.parallel(parallelTasks2, callback);
        };

        var onTeamDetails = function (err, results)
        {
            var data =
            {
                team:
                [
                    results.team1,
                    results.team2
                ],
                match: matchDoc
            };
            simulator.simulate(data, updateData);
        };

        async.parallel(parallelTasks, onTeamDetails);
    };

    var onFinish = function (err, results)
    {
        console.log(info);
        var onUpdate = function (error)
        {
            database.close();
            if (error)
            {
                console.log(error.message);
            }
            if (err)
            {
                console.log(err.message);
                if (log)
                {
                    log.log('debug', {Error: err.message});
                }
                throw err;
            }
            else
            {
                email.send(message, function (err)
                {
                    if (err)
                    {
                        console.log(err.message);
                    }
                    masterCallback(err, results);
                });
            }
        };
        database.collection('stats').updateOne({_id: 'info'}, {$set: info}, onUpdate);
    };

    var getAllMatches = function (err, callback)
    {
        var collectionName;
        switch (days.indexOf(day))
        {
            case -1:
                throw 'Invalid Day';
                break;
            default:
                collectionName = 'matchday' + day;
                break;
        }

        var collection = database.collection(collectionName);
        collection.find().toArray(callback)
    };

    var ForAllMatches = function (err, docs)
    {
        if (err)
        {
            console.log(err.message);
            if (log)
            {
                log.log('debug', {Error: err.message});
            }
            throw err;
        }
        else
        {
            async.map(docs, forEachMatch, onFinish);
        }
    };

    var onConnect = function (err, db)
    {
        if (err)
        {
            console.log(err.message);
            if (log)
            {
                log.log('debug', {Error: err.message});
            }
            throw err;
        }
        else
        {
            database = db;
            var onGetInfo = function (err, doc)
            {
                if (err)
                {
                    console.log(err.message);
                }
                else
                {
                    stats = doc;
                    getAllMatches(err, ForAllMatches);
                }
            };
            database.collection('stats').findOne({}, onGetInfo);
        }
    };

    MongoClient.connect(mongoUri, databaseOptions, onConnect);
};