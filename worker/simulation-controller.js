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
var match = require(path.join(__dirname,'..','matchCollection'));
var log;
var key = process.env.PASSWORD || require(path.join(__dirname, '..', 'key.js'));
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}
var ref = {
    'users' : 1,
    'round2' : 2,
    'round3' : 3
};
var simulator = require(path.join(__dirname, 'simulation'));
var email = require('nodemailer').createTransport({
    service: 'Gmail',
    auth: {
        user: 'gravitaspremierleague@gmail.com',
        pass: key
    }
});

var options = {
    from: 'gravitaspremierleague@gmail.com',
    to: '',
    subject: 'Round ' + ref[match] + ', match ' + (process.env.DAY || 1) + ' results are out!',
    text: 'Please click on http://gravitaspremierleague.com/home/matches to see your scores!\n '
    + '\n\nRegards, \nTeam G.P.L.'
};

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/GPL';
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
    var forEachMatch = function (matchDoc, callback)
    {
        var parallelTasks = {
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
                //
                database.collection(match).updateOne({_id: newUserDoc._id}, newUserDoc, function() {
                    options.to = newUserDoc.email;
                    email.sendMail(options, function(err) {
                        if(err)
                        {
                            console.log(err.message);
                        }
                        asyncCallback();
                    });
                });
            };

            var updateMatch = function (newMatchDoc, asyncCallback)
            {
                database.collection('matchday' + day).updateOne({_id: newMatchDoc._id}, newMatchDoc, asyncCallback);
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
            console.log(newData.team1._id + ' vs ' + newData.team2._id + ' (Match ' + newData.match._id + ') is now being updated');
            async.parallel(parallelTasks2, callback)
        };

        var onTeamDetails = function (err, results)
        {
            var data =
            {
                team: [
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
            case 1 || 2 || 3 || 4 || 5 || 6 || 7:
                collectionName = 'matchday' + day;
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