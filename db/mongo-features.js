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

require('./database')(function(err, db){
    if(err)
    {
        throw err;
    }
    else
    {
        exports.insert = function (doc, callback)
        {
                    collection = db.collection('features');
                    var onInsert = function (err, docs)
                    {
                        if (err)
                        {
                            callback(err, null);
                        }
                        else
                        {
                            callback(null, docs)
                        }
                    };
                    collection.insertOne(doc, {w: 1}, onInsert);
        };

        exports.getInfo = function (callback)
        {
                    collection = db.collection('stats');
                    var onGetInfo = function (err, doc)
                    {
                        if (err)
                        {
                            callback(err);
                        }
                        else
                        {
                            callback(null, doc);
                        }
                    };
                    collection.findOne(onGetInfo);
        };

        exports.notify = function (callback)
        {
                    collection = db.collection('features');
                    var onFind = function (err, docs)
                    {
                        if (err)
                        {
                            callback(err);
                        }
                        else
                        {
                            callback(null, docs);
                        }
                    };
                    collection.find().toArray(onFind);
        };

        exports.simulate = function (callback)
        {
            var simulationControl = require(path.join(__dirname, '..', 'worker', 'simulation-controller'));
            var onSimulate = function (err, docs)
            {
                if (err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, docs);
                }
            };
            simulationControl.initSimulation(process.env.DAY || 1, onSimulate);
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

                            var onFinish = function(err, result)
                            {
                                if(err)
                                {
                                    callback(err);
                                }
                                else
                                {
                                    callback(null, result);
                                }
                            };
                            async.map(docs, onMap, onFinish);
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
                collection = db.collection('matchday' + day);
                var onMatch = function (err, doc)
                {
                    if (err)
                    {
                        callback(err);
                    }
                    else
                    {
                        callback(null, doc);
                    }
                };
                collection.findOne(filter, onMatch);
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
                        var onGetSquad = function (err, squad)
                        {
                            if (err)
                            {
                                callback(err);
                            }
                            else
                            {
                                callback(null, squad);
                            }
                        };
                        mongoTeam.squad({team_no: doc}, onGetSquad);
                    }
                };
                mongoTeam.opponent(day, team, onOpponent);
            }
        };
    }
});