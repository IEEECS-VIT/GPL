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
    "sort":
    [
        ['points', -1],
        ['net_run_rate', -1]
    ]
};
var collection;
var leaderboard;
var path = require('path');
var mongoFeatures = require(path.join(__dirname, 'mongo-features.js'));
var match = require(path.join(__dirname, '..', 'schedule', 'matchCollection.js'));

if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

require('./database')(function(err, db){
    if(err)
    {
        throw err;
    }
    else
    {
        exports.getCount = function (query, callback)
        {
                    collection = db.collection(match);
                    var onFetch = function (err, count)
                    {
                        if (err)
                        {
                            callback(err);
                        }
                        else
                        {
                            callback(null, count);
                        }
                    };
                    collection.count(query, onFetch);
        };

        exports.insert = function (doc, callback)
        {
                    collection = db.collection(match);
                    var onInsert = function (err, docs)
                    {
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
        };

        exports.fetch = function (doc, callback)
        {
                    collection = db.collection(match);
                    var onFetch = function (err, document)
                    {
                        if (err)
                        {
                            callback(err, null);
                        }
                        else if (document && (doc['_id'] === document['_id']))
                        {
                            callback(null, document);
                        }
                        else
                        {
                            callback(false, null);
                        }
                    };
                    collection.findOne(doc, onFetch);
        };

        exports.getLeader = function (user, callback)
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
        };

        exports.forgotPassword = function (doc, op, callback)
        {
                    collection = db.collection(match);
                    var onFetch = function (err, document)
                    {
                        if (err)
                        {
                            callback(err, null);
                        }
                        else if (document.value)
                        {
                            var onCount = function(err, doc)
                            {
                                if(err)
                                {
                                    callback(err);
                                }
                                else
                                {
                                    callback(null, true);
                                }
                            };
                            mongoFeatures.forgotCount({password : 1}, onCount);
                        }
                        else
                        {
                            callback(false, null);
                        }
                    };
                    collection.findOneAndUpdate(doc, {$set : op}, onFetch);
        };

        exports.forgotUser = function (doc, callback)
        {
                    collection = db.collection(match);
                    var onFetch = function (err, docs)
                    {
                        if (err)
                        {
                            callback(err, null);
                        }
                        else if (docs.length)
                        {
                            var results = "";
                            for (i = 0; i < docs.length; ++i)
                            {
                                results += '<li>' + docs[i]._id + ' (' + docs[i].authStrategy + ')' + '</li>';
                            }
                            var onCount = function(err, doc)
                            {
                                if(err)
                                {
                                    callback(err);
                                }
                                else
                                {
                                    callback(null, results);
                                }
                            };
                            mongoFeatures.forgotCount({user : 1}, onCount);
                        }
                        else
                        {
                            callback(false, null);
                        }
                    };
                    collection.find(doc, {_id: 1, authStrategy : 1}).toArray(onFetch);
        };


        exports.getReset = function (doc, callback)
        {
                    collection = db.collection(match);
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
                        else
                        {
                            callback(false, null);
                        }
                    };
                    collection.findOne(doc, onFetch);
        };

        exports.resetPassword = function (doc, op, callback)
        {
                    collection = db.collection(match);
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
                        else
                        {
                            callback(false, null);
                        }
                    };
                    collection.findOneAndUpdate(doc, op, onFetch);
        };

        exports.updateUserTeam = function (doc, arr, stats, cost, callback)
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
                            callback(true, document);
                        }
                    };
                    collection.findOneAndUpdate(doc, {
                        $set:
                        {
                            'team': arr,
                            'stats': stats,
                            'surplus': cost
                        }
                    }, {}, onUpdate)
        };

        exports.updateMatchSquad = function (doc, arr, callback)
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
                            callback(null, document);
                        }
                    };
                    collection.findOneAndUpdate(doc, {$set: {'squad': arr}}, {}, onUpdate);
        };

        exports.fetchUser = function (doc, callback)
        {
                    collection = db.collection(match);
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

        exports.update = function (query, update, callback)
        {
                    collection = db.collection(match);
                    var onUpdate = function (err, doc)
                    {
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
        };

        exports.get = function (doc, callback)
        {
                    collection = db.collection(match);
                    var onFind = function (err, user)
                    {
                        if (err)
                        {
                            callback(err);
                        }
                        else
                        {
                            callback(null, user);
                        }
                    };
                    collection.findOne({_id: doc}, onFind);
        };

        exports.save = function (doc, callback)
        {
                    collection = db.collection(match);
                    var onSave = function (err)
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
                    collection.save(doc, onSave);
        };

        exports.admin = function (doc, callback)
        {
                    collection = db.collection('admin');
                    var onGetAdmin = function (err, document)
                    {
                        if (err)
                        {
                            callback(err);
                        }
                        else if(document && document._id === doc._id)
                        {
                            callback(null, document);
                        }
                        else
                        {
                            callback(false, null);
                        }
                    };
                    collection.findOne(doc, onGetAdmin);
        };
    }
});