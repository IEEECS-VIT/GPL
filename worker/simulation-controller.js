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
var match;
var daily = 0;
var stats = {};
var points = 0;
var individual = 0;
var path = require('path');
var async = require('async');
var days = [1, 2, 3, 4, 5, 6, 7];
var email = require(path.join(__dirname, 'email'));
var simulator = require(path.join(__dirname, 'simulation'));

if(!process.env.NODE_ENV)
{
    require('dotenv').load({path : path.join(__dirname, '..', '.env')});
}

if (process.env.LOGENTRIES_TOKEN)
{
    log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}

match = process.env.MATCH;
email.match.header.bcc = [];

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
                    db.collection('players').find({_id: elt}).limit(1).next(subCallback);
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

            db.collection(match).find(query).limit(1).next(getRating);
        };

        var updateData = function (err, newData)
        {
            var updateUser = function (newUserDoc, asyncCallback)
            {
                if(newUserDoc.squad.length)
                {
                    stats.six += (newUserDoc.s || 0);
                    stats.four += (newUserDoc.f || 0);
                    stats.runs += newUserDoc.scores[day - 1] || 0;
                    stats.overs += newUserDoc.overs[day - 1] || 0;
                    stats.wickets += newUserDoc.wickets[day - 1] || 0;

                    if(newUserDoc.scores[day - 1] > daily)
                    {
                        daily = newUserDoc.scores[day - 1];
                        stats.daily.total.team = newUserDoc._id;
                        stats.daily.total.value = newUserDoc.scores[day - 1];
                    }
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
                        if (!newUserDoc.squad[i].match(/^b/))
                        {
                            if(newUserDoc.stats[newUserDoc.squad[i]].recent[day - 1] > individual)
                            {
                                stats.daily.individual.team = newUserDoc._id;
                                stats.daily.individual.player = newUserDoc.names[i] || '';
                                individual = newUserDoc.stats[newUserDoc.squad[i]].recent[day - 1];
                                stats.daily.individual.value = newUserDoc.stats[newUserDoc.squad[i]].recent[day - 1];
                            }
                            if(newUserDoc.stats[newUserDoc.squad[i]].high > stats.high.individual.value)
                            {
                                stats.high.individual.team = newUserDoc._id;
                                stats.high.individual.player = newUserDoc.names[i] || '';
                                stats.high.individual.value = newUserDoc.stats[newUserDoc.squad[i]].high;
                            }
                            if(newUserDoc.stats[newUserDoc.squad[i]].runs_scored > stats.orange.runs)
                            {
                                stats.orange.team = newUserDoc._id;
                                stats.orange.player = newUserDoc.names[i] || '';
                                stats.orange.avg = newUserDoc.stats[newUserDoc.squad[i]].average;
                                stats.orange.balls = newUserDoc.stats[newUserDoc.squad[i]].balls;
                                stats.orange.runs = newUserDoc.stats[newUserDoc.squad[i]].runs_scored;
                                stats.orange.sr = newUserDoc.stats[newUserDoc.squad[i]].strike_rate;
                            }
                        }
                        if (newUserDoc.squad[i].match(/^[^a]/) && newUserDoc.stats[newUserDoc.squad[i]].wickets_taken > stats.purple.wickets)
                        {
                            stats.purple.team = newUserDoc._id;
                            stats.purple.player = newUserDoc.names[i] || '';
                            stats.purple.sr = newUserDoc.stats[newUserDoc.squad[i]].sr;
                            stats.purple.avg = newUserDoc.stats[newUserDoc.squad[i]].avg;
                            stats.purple.balls = newUserDoc.stats[newUserDoc.squad[i]].overs;
                            stats.purple.economy = newUserDoc.stats[newUserDoc.squad[i]].economy;
                            stats.purple.wickets = newUserDoc.stats[newUserDoc.squad[i]].wickets_taken;
                        }
                    }
                }

                delete newUserDoc.f;
                delete newUserDoc.s;
                delete newUserDoc.names;

                db.collection(match).updateOne({_id: newUserDoc._id}, newUserDoc, asyncCallback);
            };

            var updateMatch = function (newMatchDoc, asyncCallback)
            {
                if (points < (newMatchDoc.MoM.points || 0))
                {
                    stats.daily.MoM = newMatchDoc.MoM;
                    points = newMatchDoc.MoM.points;
                }

                db.collection('matchday' + day).updateOne({_id: newMatchDoc._id}, newMatchDoc, asyncCallback);
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
        var onUpdate = function (error)
        {
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
                masterCallback(null, results);
/*              if(message.header.bcc.length > 500)
                {
                    var temp = message.header.bcc;
                    var parallelEmails = [];
                    while(temp.length)
                    {
                        parallelEmails.push(function(asyncCallback){
                            message.header.bcc = temp.splice(0, 500);
                            email.send(message, asyncCallback);
                        });
                    }
                    async.parallel(parallelEmails, masterCallback(err, results));
                }
                else
                {
                  email.send(email.match, function (err)
                    {
                        if (err)
                        {
                            console.log(err.message);
                        }
                        else
                        {
                            console.log(message.header.bcc.length + ' emails sent for round ' + ref[process.env.MATCH] + ', match ' + process.env.DAY);
                        }

                        masterCallback(err, results);
                    });
                }
 */         }
        };

        db.collection('stats').updateOne({_id: 'stats'}, {$set: stats}, onUpdate);
    };

    var getAllMatches = function (err, callback)
    {
        var collection;
        switch (days.indexOf(day))
        {
            case -1:
                throw 'Invalid Day';
                break;
            default:
                collection = 'matchday' + day;
                break;
        }

        db.collection(collection).find().toArray(callback)
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

    db.collection('stats').find().limit(1).next(onGetInfo);
};