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
var slice =
{
    _id : 0,
    fours : 1,
    sixes : 1,
    run_rates : 1,
    progression : 1,
    scored_per_over : 1,
    conceded_per_over : 1
};
var async = require('async');
var match = process.env.MATCH;
var path = require('path').join;
var mongoUsers = require(path(__dirname, 'mongoUsers'));
var mongoFeatures = require(path(__dirname, 'mongoFeatures'));

exports.getTeam = function (doc, callback)
{
    var onFetch = function (err, document)
    {
        if (!document.team.length)
        {
            return callback(null, []);
        }
        else if (err)
        {
            return callback(err, null);
        }
        else
        {
            async.map(document.team, mongoFeatures.getPlayer, callback);
        }
    };

    db.collection(match).find(doc).limit(1).next(onFetch);
};

exports.getSquad = function (doc, callback)
{
    var coach;

    var onFinish = function (err, documents)
    {
        var onGetCoach = function (err, doc)
        {
            if (err)
            {
                return callback(err, null)
            }
            else
            {
                documents.push(doc);
                return callback(null, documents);
            }
        };

        if (err)
        {
            throw err;
        }
        else
        {
            mongoFeatures.getPlayer(coach, onGetCoach);
        }
    };

    var onFetch = function (err, document)
    {
        if (document)
        {
            if (err)
            {
                return callback(err, null);
            }
            else if (document.team.length)
            {
                coach = document.team.find((arg) => arg > 'd');

                async.map(document.squad, mongoFeatures.getPlayer, onFinish);
            }
            else
            {
                return callback(null, []);
            }
        }
        else
        {
            return callback(null, []);
        }
    };

    db.collection(match).find(doc).limit(1).next(onFetch);
};

exports.dashboard = function (doc, callback)
{
    db.collection(match).find(doc, slice).limit(1).next(callback);
};

exports.map = function (doc, callback)
{
    var onFind = function (err, doc)
    {
        if (err)
        {
            return callback(err);
        }
        else
        {
            return callback(null, doc.teamNo);
        }
    };

    db.collection(match).find(doc, {teamNo: 1}).limit(1).next(onFind);
};

exports.shortlist = function (callback) // TODO: add email notification for shortlisted team owners.
{
    var ref =
    {
        'users' :
        {
            out: 'round2',
            limit: parseInt(process.env.ONE, 10)
        },
        'round2':
        {
            out: 'round3',
            limit: 8
        },
        'round3':
        {
            out: null,
            limit: 8
        }
    };

    var onShortList = function (err, docs)
    {
        if (err)
        {
            return callback(err);
        }
        else
        {
            i = 0;

            async.map(docs, function(arg, asyncCallback){
                arg.teamNo = ++i;
                asyncCallback();
            }, function(err, result){
                if(err)
                {
                    return callback(err);
                }
                else
                {
                    db.collection(ref[match].out).insertMany(result, callback);
                }
            });
        }
    };

    db.collection(match).aggregate([{
        $sort :
        {
            points : -1,
            net_run_rate : -1,
            win : -1,
            loss : 1
        }
    },
        {
            $limit : ref[match].limit
        }
    ], onShortList);
};

exports.adminInfo = function (callback)
{
    var onParallel = function (err, result)
    {
        if (err)
        {
            return callback(err);
        }
        else
        {
            delete result.database.ok;
            delete result.database.extentFreeList;
            result.database.indexSize = (result.database.indexSize / 1024).toFixed(2) + ' KB';
            result.database.avgObjSize = (result.database.avgObjSize / 1024).toFixed(2) + ' KB';
            result.database.dataSize = (result.database.dataSize / 1024 / 1024).toFixed(2) + ' MB';
            result.database.fileSize = (result.database.fileSize / 1024 / 1024).toFixed(2) + ' MB';
            result.database.storageSize = (result.database.storageSize / 1024 / 1024).toFixed(2) + ' MB';
            result.database.version = result.database.dataFileVersion.major + '.' + result.database.dataFileVersion.minor;
            delete result.database.dataFileVersion;

            return callback(null, result);
        }
    };

    var parallelTasks =
    {
        interest: function (asyncCallback)
        {
            mongoUsers.getCount('interest', {}, asyncCallback);
        },
        total: function (asyncCallback)
        {
            mongoUsers.getCount({authStrategy: {$ne : 'admin'}}, asyncCallback);
        },
        facebook: function (asyncCallback)
        {
            mongoUsers.getCount({authStrategy: 'facebook'}, asyncCallback);
        },
        google: function (asyncCallback)
        {
            mongoUsers.getCount({authStrategy: 'google'}, asyncCallback);
        },
        twitter: function (asyncCallback)
        {
            mongoUsers.getCount({authStrategy: 'twitter'}, asyncCallback);
        },
        local: function (asyncCallback)
        {
            mongoUsers.getCount({authStrategy: 'local'}, asyncCallback);
        },
        emptySquad: function (asyncCallback)
        {
            mongoUsers.getCount({squad: []}, asyncCallback);
        },
        emptyTeam: function (asyncCallback)
        {
            mongoUsers.getCount({team: []}, asyncCallback);
        },
        features: function (asyncCallback)
        {
            mongoFeatures.notify(asyncCallback);
        },
        forgot: function (asyncCallback)
        {
            mongoFeatures.forgotCount({password: 0}, asyncCallback);
        },
        database: function(asyncCallback)
        {
            mongoFeatures.adminStats(asyncCallback);
        }
    };

    async.parallel(parallelTasks, onParallel);
};

exports.fetchMatches = function (team, callback)
{
    var parallelTasks = Array.apply(null, Aray(7))
                             .map((_, i) => {
                                 return (asyncCallback) => {
                                     mongoFeatures.match(i + 1, team, asyncCallback);
                                 }
                             });

    async.parallel(parallelTasks, callback);
};

exports.opponent = function (day, team, callback)
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

    var onFind = function (err, doc)
    {
        if (err)
        {
            return callback(err);
        }
        else
        {
            return callback(null, (team === doc.Team_1) ? doc.Team_2 : doc.Team_1);
        }
    };

    db.collection('matchday' + day).find(filter).limit(1).next(onFind);
};

exports.squad = function (doc, callback)
{
    var onSquad = function (err, doc)
    {
        doc.team.sort();

        if (err)
        {
            return callback(err);
        }
        else
        {
            var onGet = function (err, results)
            {
                doc.team = results;

                return callback(null, doc);
            };

            async.map(doc.team, mongoFeatures.getPlayer, onGet);
        }
    };

    db.collection(match).find(doc, {team: 1}).limit(1).next(onSquad);
};
