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
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/GPL';
var match = require(path.join(__dirname, '..', 'schedule', 'matchCollection.js'));

var getPlayer = function (id, callback)
{
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

exports.getTeam = function (doc, callback)
{
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

exports.getSquad = function (doc, callback)
{
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
                if (document)
                {
                    if (err)
                    {
                        callback(err, null);
                    }
                    else if (document.team.length != 0)
                    {
                        for (var i = 0; i < 16; i++) {
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

exports.dashboard = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var slice =
            {
                dob: 0,
                email: 0,
                phone: 0,
                squad: 0,
                team: 0,
                manager_name: 0,
                authStrategy: 0,
                surplus: 0
            };
            var onFind = function (err, doc)
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
            collection.findOne(doc, slice, onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.map = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onFind = function (err, doc)
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
            collection.find(doc, {team_no: 1}, onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.shortList = function (callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onShortList = function (err, doc)
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
            collection.aggregate(onShortList);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.adminInfo = function (callback)
{
    var onParallel = function (err, result)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            callback(null, result);
        }
    };

    var parallelTasks =
    {
        total: function (asyncCallback) {
            mongoUsers.getCount({}, asyncCallback);
        },
        facebook: function (asyncCallback) {
            mongoUsers.getCount({authStrategy: 'facebook'}, asyncCallback);
        },
        google: function (asyncCallback) {
            mongoUsers.getCount({authStrategy: 'google'}, asyncCallback);
        },
        twitter: function (asyncCallback) {
            mongoUsers.getCount({authStrategy: 'twitter'}, asyncCallback);
        },
        local: function (asyncCallback) {
            mongoUsers.getCount({authStrategy: 'local'}, asyncCallback);
        },
        emptySquad: function (asyncCallback) {
            mongoUsers.getCount({squad: []}, asyncCallback);
        },
        emptyTeam: function (asyncCallback) {
            mongoUsers.getCount({team: []}, asyncCallback);
        },
        features: function (asyncCallback) {
            mongoFeatures.notify(asyncCallback);
        }
    };
    async.parallel(parallelTasks, onParallel);
};

exports.fetchMatches = function (team, callback)
{
    var onParallel = function (err, result)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            callback(null, result);
        }
    };

    var parallelTasks =
        [
            function (asyncCallback)
            {
                mongoMatches.match(1, team, asyncCallback);
            },
            function (asyncCallback)
            {
                mongoMatches.match(2, team, asyncCallback);
            },
            function (asyncCallback)
            {
                mongoMatches.match(3, team, asyncCallback);
            },
            function (asyncCallback)
            {
                mongoMatches.match(4, team, asyncCallback);
            },
            function (asyncCallback)
            {
                mongoMatches.match(5, team, asyncCallback);
            },
            function (asyncCallback)
            {
                mongoMatches.match(6, team, asyncCallback);
            },
            function (asyncCallback)
            {
                mongoMatches.match(7, team, asyncCallback);
            }
        ];
    async.parallel(parallelTasks, onParallel);
};

exports.check = function (team, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('users');
            var onFind = function (err, result)
            {
                if (err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, result ? false : true);
                }
            };
            collection.findOne(team, onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.opponent = function (day, team, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('matchday' + day);
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
            var onFind = function (err, doc)
            {
                db.close();
                if (err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, (team == doc.Team_1) ? doc.Team_2 : doc.Team_1);
                }
            };
            collection.findOne(filter, onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

var player = function (id, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('players');
            var onPlayer = function (err, player)
            {
                db.close();
                if (err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, player);
                }
            };
            collection.findOne({_id: id}, {Name: 1, Country: 1, Type: 1}, onPlayer);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.squad = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onSquad = function (err, doc)
            {
                doc.team.sort();
                db.close();
                if (err)
                {
                    callback(err);
                }
                else
                {
                    var onGet = function (err, results)
                    {
                        doc.team = results;
                        callback(null, doc);
                    };
                    async.map(doc.team, player, onGet);
                }
            };
            collection.findOne(doc, {team: 1}, onSquad);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};