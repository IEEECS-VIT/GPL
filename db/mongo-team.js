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
var MongoClient = require('mongodb').MongoClient;
var mongoUsers = require(path.join(__dirname, 'mongo-users'));
var mongoMatches = require(path.join(__dirname, 'mongo-matches'));
var mongoFeatures = require(path.join(__dirname, 'mongo-features'));
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/GPL';
var match = require(path.join(__dirname, '..', 'schedule', 'matchCollection.js'));

var getPlayer = function (id, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('players');
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
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.getTeam = function (doc, callback) {
    console.log(doc);
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);   // match collection
            var onFetch = function (err, document)
            {
                console.log("Length " + document.team.length);
                if (document.team.length == 0)
                {
                    console.log("Reached");
                    callback(null, []);
                }
                else if (err)
                {
                    callback(err, null);
                }
                else
                {
                    async.map(document.team, getPlayer, callback);
                }
            };
            collection.findOne(doc, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.getSquad = function (doc, callback) {
    var coach;
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match); // match collection
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
                            if (document.team[i] >= 'd1')
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
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.dashboard = function(doc, callback)
{
    var onConnect = function(err, db)
    {
        if(err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onFind = function(err, doc)
            {
                if(err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, doc);
                }
            };
            collection.find(doc, onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.map = function(doc, callback)
{
    var onConnect = function(err, db)
    {
        if(err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onFind = function(err, doc)
            {
                if(err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, doc);
                }
            };
            collection.find(doc, {team_no : 1}, onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.shortList = function(callback)
{
    var onConnect = function(err, db)
    {
        if(err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onShortList = function(err, doc)
            {
                if(err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, doc);
                }
            };
            collection.aggregate(onShortList);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.adminInfo = function(callback)
{
    var onParallel = function(err, result)
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
    var onFetch = function(err, doc)
    {
        if(err)
        {
             callback(err);
        }
        else
        {
             console.log(doc);
        }
    };
    var parallelTasks =
    {
        'total' : function ()
        {
            mongoUsers.getCount(onFetch);
        },
        'facebook' : function ()
        {
            mongoUsers.getCount({authStrategy: 'facebook'}, onFetch);
        },
        'google' : function ()
        {
            mongoUsers.getCount({authStrategy: 'google'}, onFetch);
        },
        'twitter' : function ()
        {
            mongoUsers.getCount({authStrategy: 'twitter'}, onFetch);
        },
        'local' : function ()
        {
            mongoUsers.getCount({authStrategy: 'local'}, onFetch);
        },
        'emptySquad' : function ()
        {
            mongoUsers.getCount({squad: []}, onFetch);
        },
        'emptyTeam' : function ()
        {
            mongoUsers.getCount({team: []}, onFetch);
        },
        'features' : function ()
        {
            mongoFeatures.notify(onFetch);
        }
    };
    async.parallel(parallelTasks, onParallel);
};

exports.schedule = function(doc, callback)
{
     var slice = {
           _id : 0,
           scorecard : 0,
           commentary : 0
     };
     var onParallel = function(err, result)
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
     var onGet = function(err, doc)
     {
           if(err)
           {
               callback(err);
           }
           else
           {
               console.log(doc);
           }
     };
     var parallelTasks =
     [
           function()
           {
               mongoMatches.match(1, doc, slice, onGet);
           },
           function()
           {
               mongoMatches.match(2, doc, slice, onGet);
           },
           function()
           {
               mongoMatches.match(3, doc, slice, onGet);
           },
           function()
           {
               mongoMatches.match(4, doc, slice, onGet);
           },
           function()
           {
               mongoMatches.match(5, doc, slice, onGet);
           },
           function()
           {
               mongoMatches.match(6, doc, slice, onGet);
           },
           function()
           {
               mongoMatches.match(7, doc, slice, onGet);
           }
     ];
     async.parallel(parallelTasks, onParallel);
};

exports.fetchMatches = function(team, slice, callback)
{
    var onConnect = function(err, db)
    {
        if(err)
        {
            callback(err);
        }
        else
        {
            db.close();
            var matches = [];
            var day = process.env.DAY || 1;
            var onGet = function(err, doc)
            {
                if(err)
                {
                    callback(err);
                }
                else
                {
                    matches.push(doc);
                }
            };
            for(i = 1; i <= day; ++i)
            {
                mongoMatches.match(i, team, slice, onGet);
            }
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};