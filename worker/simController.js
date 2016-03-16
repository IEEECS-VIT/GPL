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
var stats;
var points = 0;
var async = require('async');
var path = require('path').join;
var helper = require(path(__dirname, 'simControlHelper'));
var email = require(path(__dirname, '..', 'utils', 'email'));

if(!process.env.NODE_ENV)
{
    require('dotenv').load({path : path(__dirname, '..', '.env')});
}

if (process.env.LOGENTRIES_TOKEN)
{
    log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}

match = process.env.MATCH;
//email.match.header.bcc = [];

exports.initSimulation = function (day, masterCallback)
{
    var forEachMatch = function (matchDoc, callback)
    {
        var getTeamDetails = function (query, asyncCallback)
        {
            var getRating = function (err, userDoc)
            {
                var onGetRating = helper.onGetRating(userDoc, asyncCallback);

                if (userDoc.squad.length < 11)
                {
                    userDoc.ratings = [];
                    asyncCallback(err, userDoc);
                }
                else
                {
                    userDoc.squad.push(UserDoc.team.filter((elt) => {return elt > 'd';})[0]);
                    async.map(userDoc.squad, helper.getEachRating, onGetRating);
                }
            };

            database.collection(match).find(query).limit(1).next(getRating);
        };

        var parallelTasks = helper.teamParallelTasks(getTeamDetails, matchDoc);

        var updateData = function (err, newData)
        {
            if(err)
            {
                console.error(err.message);
            }

            var updateUser = function (newUserDoc, asyncCallback)
            {
                if(newUserDoc.squad.length)
                {
                    stats.general = helper.generalStats(stats.general, newUserDoc, day);

                    if(newUserDoc.scores[day - 1] > stats.daily.total.value)
                    {
                        stats.daily.total = helper.dailyTotal(newUserDoc, day);
                    }
                    if(newUserDoc.highestTotal > stats.high.total.value)
                    {
                        stats.high.total = helper.total(newUserDoc, 'high');
                    }
                    if(newUserDoc.lowestTotal < stats.low.value)
                    {
                        stats.low = helper.total(newUserDoc, 'low');
                    }

                    for (i = 0; i < newUserDoc.squad.length; ++i)
                    {
                        if (!newUserDoc.squad[i].match(/^b/))
                        {
                            if(newUserDoc.stats[newUserDoc.squad[i]].recent[day - 1] > stats.daily.individual.value)
                            {
                                stats.daily.individual = helper.dailyHigh(newUserDoc, i, day);
                            }
                            if(newUserDoc.stats[newUserDoc.squad[i]].high > stats.high.individual.value)
                            {
                                stats.high.individual = helper.overallHigh(newUserDoc, i);
                            }
                            if(newUserDoc.stats[newUserDoc.squad[i]].runs > stats.orange.runs)
                            {
                                stats.orange = helper.orangeCap(i, newUserDoc);
                            }
                        }
                        if (newUserDoc.squad[i].match(/^[^a]/) && newUserDoc.stats[newUserDoc.squad[i]].wickets > stats.purple.wickets)
                        {
                            stats.purple = helper.purpleCap(i, newUserDoc);
                        }
                    }
                }

                delete newUserDoc.f;
                delete newUserDoc.s;
                delete newUserDoc.names;

                database.collection(match).updateOne({_id: newUserDoc._id}, newUserDoc, asyncCallback);
            };

            var updateMatch = function (newMatchDoc, asyncCallback)
            {
                if (points < (newMatchDoc.MoM.points || 0))
                {
                    points = newMatchDoc.MoM.points;
                    stats.daily.MoM = newMatchDoc.MoM;
                }

                database.collection('matchday' + day).updateOne({_id: newMatchDoc._id}, newMatchDoc, asyncCallback);
            };

            var parallelTasks2 = helper.userParallelTasks(newData, updateUser, updateMatch);

            console.log(newData.team1._id + ' vs ' + newData.team2._id + ' (Match ' + newData.match._id + ') is now being updated');
            async.parallel(parallelTasks2, callback);
        };

        var onTeamDetails = helper.onTeamDetails(matchDoc, updateData);

        async.parallel(parallelTasks, onTeamDetails);
    };

    var onFinish = function (err, results)
    {
        if(err)
        {
            throw err;
        }

        var onUpdate = helper.onUpdate(results, masterCallback);
        database.collection('stats').updateOne({_id: 'stats'}, {$set: stats}, onUpdate);
    };

    var forAllMatches = helper.forAllMatches(forEachMatch, onFinish);

    var onGetInfo = function (err, doc)
    {
        if (err)
        {
            throw err;
        }

        stats = doc;
        helper.getAllMatches(err, forAllMatches);
    };

    database.collection('stats').find().limit(1).next(onGetInfo);
};
