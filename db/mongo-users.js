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
var slice =
{
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
var leaderboard;
var path = require('path');
var match = process.env.MATCH;
var mongoFeatures = require(path.join(__dirname, 'mongo-features.js'));

if (process.env.LOGENTRIES_TOKEN)
{
    log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}

exports.getCount = function (query, callback)
{
    db.collection(match).count(query, callback);
};

exports.insert = function (col, doc, callback)
{
    db.collection(col).insertOne(doc, {w: 1}, callback);
};

exports.getLeader = function (user, callback)
{
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

exports.forgotPassword = function (doc, token, callback)
{
    var op =
    {
        $set:
        {
            resetToken : token,
            expire : Date.now() + 3600000
        }
    };

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

    db.collection(match).findOneAndUpdate(doc, op, onFetch);
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
            var onForgot = function(err)
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

            for (i = 0; i < docs.length; ++i)
            {
                results += '<li>' + docs[i]._id + ' (' + docs[i].authStrategy + ')' + '</li>';
            }

            mongoFeatures.forgotCount({user : 1}, onForgot);
        }
        else
        {
            callback(false, null);
        }
    };

    db.collection(match).find(doc, {authStrategy : 1}).toArray(onFetch);
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

    db.collection(match).find(doc).limit(1).next(onFetch);
};

exports.resetPassword = function (token, hash, callback)
{
    var query =
    {
        resetToken: token,
        expire:
        {
            $gt: Date.now()
        }
    };
    var op =
    {
        $set:
        {
            password_hash: hash
        },
        $unset:
        {
            resetToken: '',
            expire: ''
        }
    };

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

    db.collection(match).findOneAndUpdate(query, op, onFetch);
};

exports.updateUserTeam = function (doc, team, stats, cost, callback)
{
    db.collection(match).findOneAndUpdate(doc,
    {
        $set:
        {
            'team': team,
            'stats': stats,
            'surplus': cost
        }
    }, {}, callback)
};

exports.updateMatchSquad = function (doc, arr, callback)
{
    db.collection(match).findOneAndUpdate(doc, {$set: {'squad': arr}}, {}, callback);
};

exports.fetchUser = function (query, callback)
{
    db.collection(match).find(query).limit(1).next(callback);
};

exports.save = function (doc, callback)
{
    db.collection(match).save(doc, callback);
};