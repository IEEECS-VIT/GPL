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
var result;
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
        ['netRunRate', -1]
    ]
};
var leaderboard;
var match = process.env.MATCH;
var path = require('path').join;
var helper = require(path(__dirname, 'mongoHelper'));
var mongoFeatures = require(path(__dirname, 'mongoFeatures'));
var email = require(path(__dirname, '..', 'utils', 'email', 'email'));

var ref =
{
    other: email.message,
    interest: email.interest
};

ref[match] = email.register;

if (process.env.LOGENTRIES_TOKEN)
{
    log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}

exports.getCount = function (col, query, callback)
{
    switch(typeof col)
    {
        case 'object':
            callback = query;
            query = col;
            col = match;
            break;

        case 'function':
            callback = col;
            query = {};
            col = match;
            break;
    }

    db.collection(col).count(query, callback);
};

exports.insert = function (col, doc, callback)
{
    var onInsert = function(err)
    {
        if(err)
        {
            return callback(err);
        }
        if(col === 'features')
        {
            return callback(null);
        }

        ref[col].header.to = doc.email;
        email.send(ref[col], callback);
    };

    db.collection(col).insertOne(doc, {w: 1}, onInsert);
};

exports.getLeader = function (user, callback)
{
    var onFetch = function (err, documents)
    {
        if (err)
        {
            return callback(err, null);
        }

        flag = false;
        leaderboard = [];

        for (i = 0; i < documents.length; ++i)
        {
            if (documents[i]._id === user)
            {
                if(leaderboard.length > 9)
                {
                    documents[i].rank = i + 1;
                }

                flag = true;
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

        return callback(null, leaderboard);
    };

    db.collection(match).find({}, slice, options).toArray(onFetch);
};

exports.forgotPassword = function (doc, token, host, callback)
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
            return callback(err, null);
        }
        if(!document.value)
        {
            return callback(false, null);
        }

        ref.other.header.to = document.value.email;
        ref.other.header.subject = 'Time to get back in the game.';
        ref.other.attach_alternative(email.password(host, token));

        email.send(ref.other, helper.forgotCallback('password', callback));
    };

    db.collection(match).findOneAndUpdate(doc, op, onFetch);
};

exports.forgotUser = function (doc, callback)
{
    var onFetch = function (err, docs)
    {
        if (err)
        {
            return callback(err, null);
        }
        if(!docs.length)
        {
            return callback(false, null);
        }

        result = docs.reduce((a, b) => a + `<li>${b._id} (${b.authStrategy})</li>`, "");

        ref.other.header.to = doc.email;
        ref.other.header.subject = 'Time to get back in the game';
        ref.other.attach_alternative(email.user(result));

        email.send(ref.other, helper.forgotCallback('user', callback));
    };

    db.collection(match).find(doc, {authStrategy : 1}).toArray(onFetch);
};

exports.getReset = function (doc, callback)
{
    var onFetch = function (err, document)
    {
        if (err)
        {
            return callback(err, null);
        }
        if (document)
        {
            return callback(null, document);
        }

        return callback(false, null);
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
            passwordHash: hash
        },
        $unset:
        {
            resetToken: '',
            expire: ''
        }
    };

    var onFetch = function (err, doc)
    {
        if (err)
        {
            return callback(err, null);
        }
        if(!doc)
        {
            return callback(false, null);
        }

        doc = doc.value;
        ref.other.header.to = doc.email;
        ref.other.header.subject = 'Password change successful!';
        ref.other.attach_alternative(email.reset(doc.managerName, doc._id));

        email.send(ref.other, callback);
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
