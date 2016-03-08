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
                    stats.sixes += newUserDoc.s || 0;
                    stats.fours += newUserDoc.f || 0;
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
                        stats.high.total.value = newUserDoc.highestTotal;
                    }
                    if(newUserDoc.lowest_total < stats.low.value)
                    {
                        stats.low.team = newUserDoc._id;
                        stats.low.value = newUserDoc.lowestTotal;
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
            console.error(err.message);
        }
        else
        {
            stats = doc;
            helper.getAllMatches(err, forAllMatches);
        }
    };

    database.collection('stats').find().limit(1).next(onGetInfo);
};
