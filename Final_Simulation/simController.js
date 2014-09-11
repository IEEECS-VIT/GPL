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
var today = new Date();

var simulator = require(path.join(__dirname, 'simulation'));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

var db;
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 }, auto_reconnect: true,
    poolSize: 100 }};
var MongoClient = require('mongodb').MongoClient.connect(mongoUri, options, function (err, database)
{
    if (err) throw err;
    db = database;
    console.log("Fetch Matches for Today");
    simulator.todaysMatches(matchGenerator);
});

var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}


var matchGenerator = function (err, docs)
{
    if (err)
    {
        console.log(err.message);
    }
    else
    {
        console.log(docs.length);

        var simulate_match = function (elt, callback)
        {
            console.log("Element " + elt.Team_1);

            var parallel_tasks = {};
            var doc1 = {
                "team_no": parseInt(elt.Team_1)
            };
            var doc2 = {
                "team_no": parseInt(elt.Team_2)
            };

            console.log(doc1.team_no);

            parallel_tasks.team1 = function (asyncCallback)
            {
                mongoGetSquad(doc1, asyncCallback);
            };
            parallel_tasks.team2 = function (asyncCallback)
            {
                mongoGetSquad(doc2, asyncCallback);
            };
            parallel_tasks.user1 = function (asyncCallback)
            {
                mongoFetchUser(doc1, asyncCallback);
            };
            parallel_tasks.user2 = function (asyncCallback)
            {
                mongoFetchUser(doc2, asyncCallback);
            };
            var onFinish = function (err, results)
            {
                if (err)
                {
                    console.log(err.message);
                }
                else
                {
                    var query = {};
                    var update = {};
                    if (results.team1.length == 12 && results.team2.length == 12)
                    {
                        simulator.team(elt, results.team1, results.team2, results.user1, results.user2, function (err, doc)
                        {
                            if (err)
                            {
                                if (log) log.log('debug', {Error: err, Message: err.message});
                            }
                            else
                            {
                                updateMatch({_id: doc._id}, doc, callback);
                            }
                        });
                    }
                    else if (results.team1.length < 12 && results.team2.length < 12)
                    {
                        console.log("Both Teams Forfeit");
                        if (log) log.log('info', {Status: "Both Teams Forfeit"});
                        query = {"_id": results.user1._id};
                        update = {$inc: {"played": 1, "loss ": 1}};
                        mongoUserUpdate(query, update, function (err, res)
                        {
                            query = {"_id": results.user2._id};
                            mongoUserUpdate(query, update, callback);
                        });
                    }
                    else if (results.team1.length < 12)
                    {
                        console.log("Team 1 Forfeit");
                        if (log) log.log('info', {Status: "Team 1 Forfeit"});
                        query = {"_id": results.user1._id};
                        update = {$inc: {"played": 1, "loss": 1}};
                        mongoUserUpdate(query, update, function (err, res)
                        {
                            query = {"_id": results.user2._id};
                            update = {$inc: {"played": 1, "win": 1, "points": 2}};
                            mongoUserUpdate(query, update, callback);
                        });
                    }
                    else if (results.team2.length < 12)
                    {
                        console.log("Team 2 Forfeit");
                        if (log) log.log('info', {Status: "Team 2 Forfeit"});
                        query = {"_id": results.user2._id};
                        update = {$inc: {"played": 1, "loss": 1}};
                        mongoUserUpdate(query, update, function (err, res)
                        {
                            query = {"_id": results.user1._id};
                            update = {$inc: {"played": 1, "win": 1, "points": 2}};
                            mongoUserUpdate(query, update, callback);
                        });
                    }
                    console.log("Finished Match");


                }
            };
            async.parallel(parallel_tasks, onFinish);

        };
        //for(var i=0;i<docs.length;i++) console.log(docs[i]._id);
        async.map(docs, simulate_match, function (err, res)
        {
            if (err)
            {
                if (log) log.log('debug', {Error: err, Message: err.message});
            }
            else
            {
                db.close();
                console.log('Simulation Complete');
                if (log) log.log('info', {Status: "Simulation Complete", Docs: docs});
            }
        });
    }
};

var updateMatch = function(elt, commentary, callback)
{

    var day = today.getDate();
    var collectionName;
    switch (day)
    {
        case 0:
            collectionName = 'matchday4';
            break;
        case 1:
            collectionName = 'matchday5';
            break;
        case 2:
            collectionName = 'matchday6';
            break;
        case 3:
            collectionName = 'matchday7';
            break;
        case 4:
            collectionName = 'matchday1';
            break;
        case 5:
            collectionName = 'matchday2';
            break;
        case 6:
            collectionName = 'matchday3';
            break;
        default :
            break;

    }
    collectionName = 'matchday1';
    var collection = db.collection(collectionName);
    var doc = {
        "_id": elt._id
    };
    var onUpdate = function (err, document)
    {
        if (err)
        {
            callback(err, null);
        }
        else if (document)
        {
            callback(null, document);
        }
        else
        {
            callback(true, null);
        }
    };
    console.log('Updating ' + doc._id);
    collection.findAndModify(doc, {}, commentary, {upsert: true}, onUpdate)

};

var mongoUserUpdate = function (query, update, callback)
{
    var collection = db.collection("users");
    var onUpdate = function (err, doc)
    {
        if (err)
        {
            if (log) log.log('debug', {Error: err, Message: err.message});
            callback(true, null);
        }
        else
        {
            callback(null, doc);
        }
    };
    collection.findAndModify(query, {}, update, {"upsert": true}, onUpdate);
};

var mongoFetchUser = function (doc, callback)
{
    var collection = db.collection('users');
    var onFetch = function (err, document)
    {
        if (err)
        {
            callback(err, null);
        }
        else if (document)
        {
            callback(null, document);
        }

    };
    collection.findOne(doc, onFetch);
};

var mongoGetSquad = function (doc, callback)
{
    var coach;

    var collection = db.collection('users');
    var onFinish = function (err, documents)
    {
        var onGetCoach = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
                callback(err, null)
            }
            else
            {
                documents.push(doc);
                callback(null, documents);
            }
        };
        if (err)
        {
            throw err;
        }
        else
        {
            getPlayer(coach, onGetCoach);
        }

    };

    var onFetch = function (err, document)
    {
        console.log(document);
        if (document)
        {
            if (err)
            {
                callback(err, null);
            }
            else if (document.team.length != 0)
            {

                for (var i = 0; i < 16; i++)
                {
                    if (parseInt(document.team[i]) >= parseInt(304))
                    {
                        coach = parseInt(document.team[i]);
                    }
                }
                async.map(document.squad, getPlayer, onFinish);
            }
            else
            {
                callback(null, []);
            }

        }
        else
        {
            callback(null, []);
        }

    };
    console.log("Team " + doc.team_no);
    collection.findOne(doc, onFetch);
};

var getPlayer = function (id, callback)
{
    var collection = db.collection('players');
    var onFetch = function (err, document)
    {
        if (err)
        {
            callback(err, null);
        }
        else
        {
            callback(false, document);
        }
    };
    collection.findOne({_id: id}, onFetch);
};
