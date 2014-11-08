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

var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var match = require(path.join(__dirname, 'matchCollection'));
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';
var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}
var options = { server: { socketOptions: { connectTimeoutMS: 50000 }}};
exports.getCount = function (callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            var collection = db.collection(match);
            var onFetch = function (err, count)
            {
                db.close();
                if (err)
                {
                    throw err;
                }
                else
                {
                    callback(null, count);
                }
            };
            collection.find().count(onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);

};

exports.insert = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            var collection = db.collection(match);
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
            collection.insert(doc, {w: 1}, onInsert);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.fetch = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            var collection = db.collection(match);
            var onFetch = function (err, document)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else if (document)
                {
                    db.close();
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

exports.getleader = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        console.log("get Leader Function2");
        if (err)
        {
            callback(err);
        }
        else
        {
            console.log("get Leader Function3");
            var collection = db.collection(match);
            var onFetch = function (err, documents)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    console.log("get Leader Function4");
                    var onFetchOne = function (err, document)
                    {
                        if (err)
                        {
                            callback(err, null);
                        }
                        else
                        {
                            db.close();
                            documents.push(document);
                            callback(null, documents);
                        }
                        //console.log("get Leader Function5");

                    };
                    collection.findOne(doc, onFetchOne);
                }
            };
            var options =
                {
                    "limit": 10,
                    "sort": [
                        ['points', 'desc'],
                        ['net_run_rate', 'desc']
                    ]
                };

            collection.find({}, options).toArray(onFetch);
            //collection.find({},onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);

};

exports.forgotPassword = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err, null);
        }
        else
        {
            var collection = db.collection(match);
            var onFetch = function (err, document)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    if (document)
                    {
                        db.close();
                        callback(null, document);
                    }
                    else
                    {
                        db.close();
                        callback(false, null);
                    }

                }
            };
            collection.findOne(doc, onFetch);
        }

    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.updateUserTeam = function (doc, arr, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            var collection = db.collection(match);
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
            collection.findAndModify(doc, [], {$set: {'team': arr}}, {}, onUpdate)
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.updateround2quad = function (doc, arr, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            var collection = db.collection(match);
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
            collection.findAndModify(doc, [], {$set: {'squad': arr}}, {}, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.fetchUser = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            var collection = db.collection(match);
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

exports.update = function (query, update, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            if (log) log.log('debug', {Error: err, Message: err.message});
        }
        else
        {
            var collection = db.collection(match);
            var onUpdate = function (err, doc)
            {
                db.close();
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

        }
    };
    MongoClient.connect(mongoUri, options, onConnect);
};

