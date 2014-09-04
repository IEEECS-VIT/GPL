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
var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

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
            var collection = db.collection('users');

            var onFetch = function (err, document)
            {
                if (err)
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
                if (err)
                {
                    callback(err, null);
                }
                else
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
            };
            collection.findOne(doc, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};