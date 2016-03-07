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
var days = [1, 2, 3, 4, 5, 6, 7];

exports.rand = function (base, limit)
{
    if (limit)
    {
        return base + ((limit > base) ? rand(limit - base) : 0);
    }
    else if (base)
    {
        return ((typeof(base) === 'object') ? base[rand(base.length)] : parseInt(Math.random() * 1000000000000000, 10) % base);
    }
    else
    {
        return Math.random();
    }
};

exports.getAllMatches = function (err, callback)
{
    var collection;

    switch (days.indexOf(day))
    {
        case -1:
            throw 'Invalid Day';
        default:
            collection = 'matchday' + day;
            break;
    }

    database.collection(collection).find().toArray(callback)
};

exports.forAllMatches = function (err, docs)
{
    if (err)
    {
        throw err;
    }
    else
    {
        async.map(docs, forEachMatch, onFinish);
    }
};

exports.teamParallelTasks = function(getTeamDetails, matchDoc)
{
    return {
        team1: function (asyncCallback)
        {
            getTeamDetails({teamNo: matchDoc.Team_1}, asyncCallback);
        },
        function(asyncCallback)
        {
            getTeamDetails({teamNo: matchDoc.Team_2}, asyncCallback);
        }
    };
};

exports.userParallelTasks = function(newData, updateUser, updateMatch)
{
    return [
        function(asyncCallback)
        {
            updateUser(newData.team1, asyncCallback);
        },
        function(asyncCallback)
        {
            updateUser(newData.team2, asyncCallback);
        },
        function(asyncCallback)
        {
            updateMatch(newData.match, asyncCallback);
        }
    ];
};

exports.purpleCap = function(i, newUserDoc)
{
    return {
        team: newUserDoc._id,
        player: newUserDoc.names[i] || '',
        balls: newUserDoc.stats[newUserDoc.squad[i]].ballsBowled,
        runs: newUserDoc.stats[newUserDoc.squad[i]].runsConceded,
        sr: newUserDoc.stats[newUserDoc.squad[i]].bowlStrikeRate,
        average: newUserDoc.stats[newUserDoc.squad[i]].bowlAverage,
        economy: newUserDoc.stats[newUserDoc.squad[i]].economy,
        wickets: newUserDoc.stats[newUserDoc.squad[i]].wickets
    };
};

exports.orangeCap = function(i, newUserDoc)
{
    return {
        team: newUserDoc._id,
        player: newUserDoc.names[i] || '',
        high: newUserDoc.stats[newUserDoc.squad[i]].high,
        runs: newUserDoc.stats[newUserDoc.squad[i]].runsScored,
        balls: newUserDoc.stats[newUserDoc.squad[i]].ballsFaced,
        average: newUserDoc.stats[newUserDoc.squad[i]].batAverage,
        strikeRate: newUserDoc.stats[newUserDoc.squad[i]].batStrikeRate
    };
};

exports.makeData = function(results, matchDoc)
{
    return {
        team:
        [
            results.team1,
            results.team2
        ],
        match: matchDoc
    };
};

exports.getEachRating = function (elt, subCallback)
{
    database.collection('players').find({_id: elt}).limit(1).next(subCallback);
};

exports.validateTeams = function(length1, length2)
{

};

exports.checkMoM = function()
{

};