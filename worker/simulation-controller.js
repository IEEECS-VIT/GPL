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

var async = require('async');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;

var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var simulator = require(path.join(__dirname, 'simulation'));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';
var databaseOptions = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        },
        auto_reconnect: true,
        poolSize: 100
    }
};
var database;

exports.initSimulation = function (day, masterCallback)
{
    var forEachMatch = function (doc, callback)
    {
        var parallelTasks = {
            team1: function (asyncCallback)
            {
                getTeamDetails({team_no: doc.Team_1}, asyncCallback);
            },
            team2: function (asyncCallback)
            {
                getTeamDetails({team_no: doc.Team_2}, asyncCallback);
            }
        };

        var getTeamDetails = function (query, asyncCallback)
        {
            var getEachRating = function (elt, subCallback)
            {
                database.collection('players').findOne({_id: elt}, subCallback);
            };
            var onGetRating = function (err, results)
            {
                doc.ratings = results;
                asyncCallback(err, doc);
            };
            var getRating = function (err, doc)
            {
                if (!doc)
                {
                    console.log(query);
                }
                else if (doc.team.length < 16 || doc.squad < 11)
                {
                    asyncCallback(err, doc);
                }
                else
                {
                    var addCoach = function (elt, i, arr)
                    {
                        if (elt >= 304)
                        {
                            doc.squad.push(elt);
                        }
                    };
                    doc.team.forEach(addCoach);
                    async.map(doc.squad, getEachRating, onGetRating);
                }
            };
            database.collection('users').findOne(query, getRating);
        };

        var updateData = function (err, newData)
        {
            var updateUser = function (newDoc, asyncCallback)
            {
                database.collection('users').update(newDoc, newDoc, asyncCallback);
            };

            var updateMatch = function (newDoc, asyncCallback)
            {
                database.collection('matchday' + day).update(newDoc, newDoc, asyncCallback);
            };

            var parallelTasks2 = [
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
            async.parallel(parallelTasks2, callback)
        };

        var onTeamDetails = function (err, results)
        {
            var data = {
                team: [
                    results.team1,
                    results.team2
                ],
                match: doc
            };
            if (!results.team1 || !results.team2 || !results.match)
            {
                console.log(data);
            }
            simulator.simulate(data, updateData);
        };

        async.parallel(parallelTasks, onTeamDetails);
    };

    var onFinish = function (err, results)
    {
        database.close();
        if (err)
        {
            console.log(err.message);
            if (log) log.log('debug', {Error: err.message});
            throw err;
        }
        else
        {
            masterCallback(err, results);
        }
    };

    var getAllMatches = function (err, callback)
    {
        var collectionName;
        switch (day)
        {
            case 1:
                collectionName = 'matchday1';
                break;
            case 2:
                collectionName = 'matchday2';
                break;
            case 3:
                collectionName = 'matchday3';
                break;
            case 4:
                collectionName = 'matchday4';
                break;
            case 5:
                collectionName = 'matchday5';
                break;
            case 6:
                collectionName = 'matchday6';
                break;
            case 7:
                collectionName = 'matchday7';
                break;
            default:
                throw 'Invalid Day';
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
            if (log) log.log('debug', {Error: err.message});
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
            if (log) log.log('debug', {Error: err.message});
            throw err;
        }
        else
        {
            database = db;
            getAllMatches(err, ForAllMatches);
        }
    };

    MongoClient.connect(mongoUri, databaseOptions, onConnect);
};
