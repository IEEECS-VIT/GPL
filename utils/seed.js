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

console.time('Seeding operation took');

var database;
var mongoURI;
var mode = '';
var async = require('async');
var path = require('path').join;
var record = require(path(__dirname, '..', 'database', 'mongoRecord'));
var info = record.info;
var stats = record.stats;

try
{
    mode = testFlag ? 'test' : '';
}
catch(err)
{
    console.log('Running in test mode.');
}

var onParallel = function(err)
{
    if(err)
    {
        console.error(err.message);
    }

    database.close();

    console.timeEnd('Seeding operation took');

    if(testFlag)
    {
        require(path(__dirname, 'schedule'));
    }
};
var mongo = require('mongodb').MongoClient.connect;
var parallelTasks =
[
    function(asyncCallback)
    {
        database.collection('info').insertOne(info, asyncCallback);
    },
    function(asyncCallback)
    {
        database.collection('stats').insertOne(stats, asyncCallback);
    }
];

if(process.env.NODE_ENV)
{
    mongoURI = process.env.MONGO;
    console.warn('You are running the seed operation in a production environment. No new teams / users shall be made.');
}
else
{
    var players = record.players();
    var users = record.users(true, 8);
    mongoURI = `mongodb://127.0.0.1:27017/${mode}GPL`;

    parallelTasks.push(
        function(asyncCallback)
        {
            database.collection('users').insertMany(users, asyncCallback);
        },
        function(asyncCallback)
        {
            database.collection('round2').insertMany(users, asyncCallback);
        },
        function(asyncCallback)
        {
            database.collection('round3').insertMany(users, asyncCallback);
        },
        function(asyncCallback)
        {
            database.collection('players').insertMany(players, asyncCallback);
        }
    );
}

var onConnect = function(err, db)
{
    if(err)
    {
        console.error(err.message);
    }
    else
    {
        database = db;
        async.parallel(parallelTasks, onParallel);
    }
};

mongo(mongoURI, onConnect);
