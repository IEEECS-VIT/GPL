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
            db.collection(match).count(query, callback);
        };

        exports.insert = function (doc, callback)
        {
            db.collection('users').insertOne(doc, {w: 1}, callback);
        };

        exports.fetch = function (doc, callback)
        {
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
            db.collection(match).findOne(doc, onFetch);
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
            db.collection(match).find({}, slice, options).toArray(onFetch);
        };

        exports.forgotPassword = function (doc, op, callback)
        {
            var onFetch = function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else if (document.value)
                {
                    mongoFeatures.forgotCount({password : 1}, callback);
                }
                else
                {
                    callback(false, null);
                }
            };
            db.collection(match).findOneAndUpdate(doc, {$set : op}, onFetch);
        };

        exports.forgotUser = function (doc, callback)
        {
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
                    mongoFeatures.forgotCount({user : 1}, callback);
                }
                else
                {
                    callback(false, null);
                }
            };
            collection(match).find(doc, {_id: 1, authStrategy : 1}).toArray(onFetch);
        };


        exports.getReset = function (doc, callback)
        {
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
            db.collection(match).findOne(doc, onFetch);
        };

        exports.resetPassword = function (doc, op, callback)
        {
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
            db.collection(match).findOneAndUpdate(doc, op, onFetch);
        };

        exports.updateUserTeam = function (doc, arr, stats, cost, callback)
        {
            db.collection(match).findOneAndUpdate(doc, {
                $set:
                {
                    'team': arr,
                    'stats': stats,
                    'surplus': cost
                }
            }, {}, callback)
        };

        exports.updateMatchSquad = function (doc, arr, callback)
        {
            db.collection(match).findOneAndUpdate(doc, {$set: {'squad': arr}}, {}, callback);
        };

        exports.fetchUser = function (doc, callback)
        {
            db.collection(match).findOne(doc, callback);
        };

        exports.update = function (query, update, callback)
        {
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
            db.collection(match).findOneAndUpdate(query, update, {"upsert": true}, onUpdate);
        };

        exports.get = function (doc, callback)
        {
            db.collection(match).findOne({_id: doc}, callback);
        };

        exports.save = function (doc, callback)
        {
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
            db.collection(match).save(doc, onSave);
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