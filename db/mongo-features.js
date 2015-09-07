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
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/GPL';

exports.insert = function (doc, callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('features');
            var onInsert = function (err, docs)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    callback(null, docs)
                }
            };
            collection.insertOne(doc, {w: 1}, onInsert);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.getInfo = function (callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('stats');
            var onGetInfo = function (err, doc)
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
            collection.findOne(onGetInfo);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.notify = function (callback) {
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            collection = db.collection('features');
            var onFind = function (err, docs)
            {
                db.close();
                if (err)
                {
                    callback(err);
                }
                else
                {
                    callback(null, docs);
                }
            };
            collection.find().toArray(onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.simulate = function (callback)
{
    var simulationControl = require(path.join(__dirname, '..', 'worker', 'simulation-controller'));
    var onSimulate = function (err, docs)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            callback(null, docs);
        }
    };
    simulationControl.initSimulation(process.env.DAY || 1, onSimulate);
};

exports.forgotCount = function(option, callback)
{
      var onConnect = function(err, db)
      {
            if(err)
            {
                callback(err);
            }
            else
            {
                collection = db.collection('info');
                var onInc = function(err, doc)
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
                collection.findOneAndUpdate({_id : 'info'}, {$inc : option}, onInc);
            }
      };
      MongoClient.connect(mongoUri, onConnect);
};

exports.warnEmptyTeams = function(callback)
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
            var onFind = function(err, docs)
            {
                if (err)
                {
                    callback(err);
                }
                else
                {
                    var onMap = function(arg, mapCallback)
                    {
                        mapCallback(null, arg.email);
                    };

                    var onFinish = function(err, result)
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
                    async.map(docs, onMap, onFinish);
                }
            };
            collection.find({team : []}, {email : 1, _id : 0}).toArray(onFind);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};