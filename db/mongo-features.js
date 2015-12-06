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

var path = require('path');
var async = require('async');
var mongoTeam = require(path.join(__dirname, 'mongo-team'));
var simulator = require(path.join(__dirname, '..', 'worker', 'simulation-controller'));

exports.getStats = function (callback)
{
    db.collection('stats').find().limit(1).next(callback);
};

exports.notify = function (callback)
{
    db.collection('features').find().toArray(callback);
};

exports.simulate = function (callback)
{
    simulator.initSimulation(process.env.DAY, callback);
};

exports.forgotCount = function(option, callback)
{
    var onInc = function(err, doc)
    {
        if(err)
        {
            callback(err);
        }
        else
        {
            callback(null, doc.value);
        }
    };

    db.collection('info').findOneAndUpdate({_id : 'info'}, {$inc : option}, onInc);
};

exports.warnEmptyTeams = function(callback)
{
    var onFind = function(err, docs)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            var onMap = function(arg, mapCallback)
            {
                mapCallback(null, arg.email);
            };

            async.map(docs, onMap, callback);
        }
    };

    db.collection('users').find({$or : [{team : []}, {squad : []}]}, {email : 1, _id : 0}).toArray(onFind);
};

exports.match = function (day, team, callback)
{
    var filter =
    {
        $or:
        [
            {
                Team_1: team
            },
            {
                Team_2: team
            }
        ]
    };

    if (day <= process.env.DAY)
    {
        db.collection('matchday' + day).find(filter, {commentary : 1, scorecard : 1, count : 1}).limit(1).next(callback);
    }
    else
    {
        var onOpponent = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                mongoTeam.squad({team_no: doc}, callback);
            }
        };

        mongoTeam.opponent(day, team, onOpponent);
    }
};

exports.fetchPlayers = function (callback)
{
    db.collection('players').find({}, {_id : 1, Name : 1, Type : 1, Country : 1, Price : 1, Cost : 1}).toArray(callback);
};

exports.getPlayer = function (id, fields, callback)
{
    var query =
    {
        "_id" : id
    };

    if(typeof fields === 'function')
    {
        callback = fields;
        fields =
        {
            Type: 1,
            Name: 1,
            Country: 1
        }
    }

    var onGetPlayer = function(err, player)
    {
        if(err)
        {
            callback(err);
        }
        else if(player)
        {
            callback(null, player);
        }
        else
        {
            callback(false, null);
        }
    };

    db.collection('players').find(query, fields).limit(1).next(onGetPlayer);
};