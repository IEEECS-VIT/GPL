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
var mongoTeam = require(path.join(__dirname, 'mongo-team'));
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/GPL';

exports.fetchPreviousMatch = function (doc1, doc2, callback) {
    var parallelTasks = {};
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            db.close();
            // Collection controller for match day information. To be changed before each match
            collection = db.collection('matchday' + (process.env.DAY || 1));
            var onFetch = function (err, docs)
            {
                if (err)
                {
                    throw err;
                }
                else if (docs.team1)
                {
                    callback(null, docs.team1);
                }
                else if (docs.team2)
                {
                    callback(null, docs.team2);
                }
            };
            parallelTasks.team1 = function (asyncCallback)
            {
                collection.findOne(doc1, asyncCallback);
            };
            parallelTasks.team2 = function (asyncCallback)
            {
                collection.findOne(doc2, asyncCallback);
            };
            async.parallel(parallelTasks, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.fetchNextMatch = function (doc1, doc2, callback) {
    var parallelTasks = {};
    console.log("document 1" + doc1.Team_1);
    console.log("document 2" + doc2.Team_2);
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            collection = 'matchday' + (parseInt(process.env.DAY) + 1) || 2;
            var onFetch = function (err, doc)
            {
                db.close();
                var credentials = {};
                if (err)
                {
                    throw err;
                }
                else if (doc.team1)
                {
                    credentials =
                    {
                        'team_no': doc.team1.Team_2
                    };
                }
                else if (doc.team2)
                {
                    credentials =
                    {
                        'team_no': doc.team2.Team_1
                    };
                }
                console.log("Match" + credentials.team_no);
                mongoTeam.getTeam(credentials, callback);
            };

            collection = db.collection(collectionName);
            parallelTasks.team1 = function (asyncCallback)
            {
                collection.findOne(doc1, asyncCallback);
            };
            parallelTasks.team2 = function (asyncCallback)
            {
                collection.findOne(doc2, asyncCallback);
            };
            async.parallel(parallelTasks, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.match = function(day, filter, slice, callback)
{
    var onConnect = function(err, db)
    {
        if(err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('matchday' + day);
            var onFind = function(err, doc)
            {
                db.close();
                if(err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, doc);
                }
            };
            collection.find(filter, slice, onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};