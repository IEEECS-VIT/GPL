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

var collection;
var path = require('path');
var async = require('async');
var mongoTeam = require('./mongo-team');

require('./database')(function(err, db){
    if(err)
    {
        throw err;
    }
    else
    {
        exports.insert = function (doc, callback)
        {
            db.collection('features').insertOne(doc, {w: 1}, callback);
        };

        exports.getInfo = function (callback)
        {
            db.collection('stats').findOne(callback);
        };

        exports.notify = function (callback)
        {
            db.collection('features').find().toArray(callback);
        };

        exports.simulate = function (callback)
        {
            var simulationControl = require(path.join(__dirname, '..', 'worker', 'simulation-controller'));
            simulationControl.initSimulation(process.env.DAY || 1, callback);
        };

        exports.forgotCount = function(option, callback)
        {
            collection = db.collection('info');
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
            collection.findOneAndUpdate({_id : 'info'}, {$inc : option}, onInc);
        };

        exports.warnEmptyTeams = function(callback)
        {
            collection = db.collection('users');
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
            collection.find({team : []}, {email : 1, _id : 0}).toArray(onFind);
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
                db.collection('matchday' + day).findOne(filter, callback);
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
    }
});