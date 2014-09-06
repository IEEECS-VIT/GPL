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
var mongoTeam = require(path.join(__dirname, '..', 'db', 'mongo-team'));
var mongoUser = require(path.join(__dirname, '..', 'db', 'mongo-users'));
var simulator = require(path.join(__dirname, 'simulation'));
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';
var MongoClient = require('mongodb').MongoClient;
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

        var simulate_match = function (elt, callback )
        {

            var parallel_tasks = {};
            var doc1 = {
                "team_no": parseInt(elt.Team_1)
            };
            var doc2 = {
                "team_no": parseInt(elt.Team_2)
            };
            //console.log(doc1);

            parallel_tasks.team1 = function (asyncCallback)
            {
                mongoTeam.getSquad(doc1, asyncCallback);
            };
            parallel_tasks.team2 = function (asyncCallback)
            {
                mongoTeam.getSquad(doc2, asyncCallback);
            };
            parallel_tasks.user1 = function (asyncCallback)
            {
                mongoUser.fetchUser(doc2, asyncCallback);
            };
            parallel_tasks.user2 = function (asyncCallback)
            {
                mongoUser.fetchUser(doc2, asyncCallback);
            };
            var onFinish = function (err, results)
            {
                if (err)
                {
                    console.log(err.message);
                }
                else
                {
                    var onSimulate = function(err)
                    {
                        if(err)
                        {
                            if (log) log.log('debug', {Error: err, Message: err.message});
                        }
                        else
                        {
                            if (log) log.log('info', {Status: "Simulation Complete", Docs: docs});
                        }
                    };
                    var query = {};
                    var update = {};
                    if(results.team1.length==12 && results.team2.length==12)
                    {
                        simulator.team(elt, results.team1, results.team2, results.user1, results.user2,callback);
                    }
                    else if(results.team1.length<12 && results.team2.length<12)
                    {
                        if (log) log.log('info', {Status: "Both Teams Forfeit"});
                        query = {"_id" : results.user1._id};
                        update = {$inc : {"played" : 1, "loss " : 1}};
                        mongoUser.update(query,update,simulate_match);
                        query = {"_id" : results.user2._id};
                        mongoUser.update(query,update,simulate_match);
                        callback(null,[]);
                    }
                    else if(results.team1.length<12)
                    {
                        if (log) log.log('info', {Status: "Team 1 Forfeit"});
                        query = {"_id" : results.user1._id};
                        update = {$inc : {"played" : 1, "loss " : 1}};
                        mongoUser.update(query,update, onSimulate);
                        query = {"_id" : results.user2._id};
                        update = {$inc : {"played" : 1, "win " : 1 , "points" : 2}};
                        mongoUser.update(query,update, onSimulate);
                        callback(null,[]);
                    }
                    else if(results.team2.length<12)
                    {
                        if (log) log.log('info', {Status: "Team 2 Forfeit"});
                        query = {"_id" : results.user2._id};
                        update = {$inc : {"played" : 1, "loss " : 1}};
                        mongoUser.update(query,update, onSimulate);
                        query = {"_id" : results.user1._id};
                        update = {$inc : {"played" : 1, "win " : 1 , "points" : 2}};
                        mongoUser.update(query,update, onSimulate);
                        callback(null,[]);
                    }
                    console.log("Finished Match");


                }
            };
            async.parallel(parallel_tasks, onFinish);

        };
        //for(var i=0;i<docs.length;i++) console.log(docs[i]._id);
        async.map(docs,simulate_match,function(err,res)
        {
            if(err)
            {
                if (log) log.log('debug', {Error: err, Message: err.message});
            }
            else
            {
                var i;
                for(i=0;i<docs.length;i++)
                {
                    console.log(docs[i]._id);
                    console.log(res[i]);
                    updateMatch(docs[i],res[i],function(err,doc)
                    {
                        if(err)
                        {
                            if (log) log.log('debug', {Error: err, Message: err.message});
                        }
                        else
                        {
                            if (log) log.log('info', {Status: "Simulation Complete", Docs: doc});
                        }
                    });
                }
            }
        });
    }
};
console.log("Fetch Matches for Today");
simulator.todaysMatches(matchGenerator);


function updateMatch(elt, commentary, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
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
                    db.close();
                    callback(null, document);
                }
                else
                {
                    callback(true, null);
                }
            };
            collection.update(doc, commentary, onUpdate)
        }
    };
    MongoClient.connect(mongoUri, onConnect);
}

