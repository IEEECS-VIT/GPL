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
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/GPL';

exports.match = function (day, team, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
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
            if (day <= process.env.DAY)
            {
                collection = db.collection('matchday' + day);
                var onMatch = function (err, doc)
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
                collection.findOne(filter, onMatch);
            }
            else
            {
                db.close();
                var onOpponent = function (err, doc)
                {
                    if (err)
                    {
                        console.log(err.message);
                    }
                    else
                    {
                        var onGetSquad = function (err, squad)
                        {
                            if (err)
                            {
                                callback(err);
                            }
                            else
                            {
                                callback(null, squad);
                            }
                        };
                        mongoTeam.squad({team_no: doc}, onGetSquad);
                    }
                };
                mongoTeam.opponent(day, team, onOpponent);
            }
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};