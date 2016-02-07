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

var database;
var async = require('async');
var path = require('path').join;
var record = require(path(__dirname, '..', 'db', 'mongo-record'));
var admin = {_id: 'ADMIN', authStrategy: 'admin', password_hash: '$2a$10$ijmjpw3BJDNp5phIKmfdAeJ.ev/pbU6tXL78JgKejyjQ58OtUodtK'};  // admin@gpl
var users = record.seed(8).push(admin);
var players = [];
if(!process.env.NODE_ENV)
{
    require('dotenv').load({path: path(__dirname, '..', '.env')});
}

var onParallel = function(err)
{
    if(err)
    {
        console.error(err.message);
    }
    else
    {
        database.close();
    }
};
var mongo = require('mongodb').MongoClient.connect;
var parallelTasks =
[
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
    },
    function(asyncCallback)
    {
        // generate schedule here
    }
];

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

mongo(process.env.MONGO, onConnect);
