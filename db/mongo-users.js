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
        ['net_run_rate', -1]
    ]
};
var leaderboard;
var path = require('path');
var match = process.env.MATCH;
var email = require(path.join(__dirname, '..', 'utils', 'email'));
var mongoFeatures = require(path.join(__dirname, 'mongo-features.js'));

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
            callback(err);
        }
        else
        {
            if(col !== 'features')
            {
                ref[col].header.to = doc.email;
                email.send(ref[col], callback);
            }
            else
            {
                callback(null);
            }
        }
    };

    db.collection(col).insertOne(doc, {w: 1}, onInsert);
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
            callback(err, null);
        }
        else if (document.value)
        {
            ref.other.header.to = document.value.email;
            ref.other.header.subject = 'Time to get back in the game.';
            ref.other.attach_alternative(
            "<table background='http://res.cloudinary.com/gpl/general/img1.jpg' align='center' cellpadding='0' " +
                "cellspacing='0' width='600' style ='box-shadow: 5px 5px 15px #888888; border-radius: 12px; " +
                "background-position: center; border-collapse: collapse;'>" +
                "<tr>" +
                    "<td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 " +
                    "40px 0;color: #ffd195;'>" +
                    "graVITas Premier League" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td style='color:#FFFFFF;' align=\'left\' style=\'padding: 2px 30px 40px 30px;font-family: Arial;" +
                        " line-height:30px; font-size:large;\'>" +
                        "Please click <a href='http://" + host + "/reset/" + token + "'>here</a> in " +
                        "order to reset your password.<br>For the purposes of security, this link is valid for one " +
                        "use only, and shall expire in sixty minutes. <br> In the event that this password reset was" +
                        " not requested by you, please ignore this message and your password shall remain intact.<br>" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;" +
                        "color: #ffd195; font-weight: bold;'>Regards,<br>Team GPL<br>IEEE Computer Society<br>VIT Student chapter" +
                    "</td>" +
                "</tr>" +
            "</table>"
            );

            var onUpdate = function(err)
            {
                if(err)
                {
                    callback(err);
                }
                else
                {
                    mongoFeatures.forgotCount({password : 1}, callback);
                }
            };

            email.send(ref.other, onUpdate);
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
            result = docs.reduce((a, b) => a + '<li>' + b._id + ' (' + b.authStrategy + ')' + '</li>', "");

            ref.other.header.to = doc.email;
            ref.other.header.subject = 'Time to get back in the game';
            ref.other.attach_alternative("The following teams were found in association with your details:<br><br>" +
                "<ol>" + result + "</ol><br><br>Regards, <br>Team G.P.L<br>IEEE Computer Society");

            var onUser = function(err)
            {
                if(err)
                {
                    callback(err);
                }
                else
                {
                    mongoFeatures.forgotCount({user : 1}, callback);
                }
            };

            email.send(ref.other, onUser);
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

    var onFetch = function (err, doc)
    {
        if (err)
        {
            callback(err, null);
        }
        else if (doc)
        {
            ref.other.header.to = doc.value.email;
            ref.other.header.subject = 'Password change successful!';
            ref.other.attach_alternative(
            "<table background='http://res.cloudinary.com/gpl/general/img3.jpg' align='center' cellpadding='0' cellspacing='0'" +
                " width='600' style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center;" +
                " border-collapse: collapse;'>" +
                "<tr>" +
                    "<td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;" +
                        "color: #ffd195;'>" +
                        "graVITas Premier League" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td style='color:#FFFFFF;' align='left' style='padding: 5px 30px 40px 30px;font-family: Arial; " +
                        "line-height:30px; font-size:x-large;'>" +
                        "Hey there, " + doc.value.manager_name + "!<br>We\'re just writing in to let you know that " +
                        "the recent password change for your team " + doc.value._id + " was successful.<br>Welcome " +
                        "Back to G.P.L!" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color:" +
                        " #ffd195; font-weight: bold;'>" +
                        "Regards,<br>Team GPL<br>IEEE Computer Society<br>VIT Student chapter" +
                    "</td>" +
                "</tr>" +
            "</table>"
            );

            email.send(ref.other, callback);
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