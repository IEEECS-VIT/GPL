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

var i;
var log;
var flag;
var slice = {
    win: 1,
    points: 1,
    played: 1,
    net_run_rate: 1
};
var options =
{
    "sort": [
        ['points', -1],
        ['net_run_rate', -1]
    ]
};
var collection;
var leaderboard;
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/GPL';
var dbOptions = {server: {socketOptions: {connectTimeoutMS: 50000}}};
var match = require(path.join(__dirname, '..', 'schedule', 'matchCollection.js'));

if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

exports.getCount = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onFetch = function (err, count)
            {
                db.close();
                if (err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, count);
                }
            };
            collection.count(doc, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.insert = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onInsert = function (err, docs)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    callback(null, docs);
                }
            };
            collection.insertOne(doc, {w: 1}, onInsert);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.fetch = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onFetch = function (err, document)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else if (document)
                {
                    if (doc['_id'] === document['_id'])
                    {
                        callback(null, document);
                    }
                    else
                    {
                        callback(false, null);
                    }
                }
                else
                {
                    callback(false, null);
                }
            };
            collection.findOne(doc, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.getLeader = function (user, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onFetch = function (err, documents)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    flag = false;
                    leaderboard = [];
                    for (i = 0; i < documents.length; ++i)
                    {
                        if (documents[i]._id == user)
                        {
                            flag = true;
                            documents[i].rank = i + 1;
                            leaderboard.push(documents[i]);
                        }
                        else if (leaderboard.length < 10)
                        {
                            leaderboard.push(documents[i]);
                        }
                        else if (flag)
                        {
                            break;
                        }
                    }
                    callback(null, leaderboard);
                }
            };
            collection.find({}, slice, options).toArray(onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.forgotPassword = function (doc, op, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err, null);
        }
        else
        {
            collection = db.collection(match);
            var onFetch = function (err, document)
            {
                db.close();
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
                    callback(false, null);
                }
            };
            collection.findOneAndUpdate(doc, op, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.forgotUser = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err, null);
        }
        else
        {
            collection = db.collection(match);
            var onFetch = function (err, docs)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else if (docs.length)
                {
                    var results = "";
                    for (i = 0; i < docs.length; ++i)
                    {
                        results += '<li>' + docs[i]._id + '</li>';
                    }
                    callback(null, results);
                }
                else
                {
                    callback(false, null);
                }
            };
            collection.find(doc, {_id: 1}).toArray(onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.getReset = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err, null);
        }
        else
        {
            collection = db.collection(match);
            var onFetch = function (err, document)
            {
                db.close();
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
                    callback(false, null);
                }
            };
            collection.findOne(doc, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.resetPassword = function (doc, op, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err, null);
        }
        else
        {
            collection = db.collection(match);
            var onFetch = function (err, document)
            {
                db.close();
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
                    callback(false, null);
                }
            };
            collection.findOneAndUpdate(doc, op, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.updateUserTeam = function (doc, arr, stats, cost, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onUpdate = function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    db.close();
                    callback(true, document);
                }
            };
            collection.findOneAndUpdate(doc, {
                $set: {
                    'team': arr,
                    'stats': stats,
                    'surplus': 10000000 - cost
                }
            }, {}, onUpdate)
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.updateMatchSquad = function (doc, arr, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onUpdate = function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    console.log("Done");
                    db.close();
                    callback(null, document);
                }
            };
            collection.findOneAndUpdate(doc, {$set: {'squad': arr}}, {}, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.fetchUser = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onFetch = function (err, document)
            {
                db.close();
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
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.update = function (query, update, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            if (log)
            {
                log.log('debug', {Error: err, Message: err.message});
            }
        }
        else
        {
            collection = db.collection(match);
            var onUpdate = function (err, doc)
            {
                db.close();
                if (err)
                {
                    if (log)
                    {
                        log.log('debug', {Error: err, Message: err.message});
                    }
                    callback(true, null);
                }
                else
                {
                    callback(null, doc);
                }
            };
            collection.findOneAndUpdate(query, update, {"upsert": true}, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, dbOptions, onConnect);
};

exports.get = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onFind = function (err, user)
            {
                db.close();
                if (err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, user);
                }
            };
            collection.findOne({_id: require('mongodb').ObjectID(doc)}, onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.save = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection(match);
            var onSave = function (err)
            {
                db.close();
                if (err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, doc);
                }
            };
            collection.save(doc, onSave);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.admin = function(doc, callback)
{
    var onConnect = function(err, db)
    {
        if(err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('admin');
            var onGetAdmin = function(err, doc)
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
            collection.find(onGetAdmin);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.addSocialTeam = function(team, callback)
{
    var onConnect = function(err, db)
    {
        if(err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('users');
            var onUpdate = function(err, doc)
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
            collection.updateOne(team, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};