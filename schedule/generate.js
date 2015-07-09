/*
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 10/8/14.
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
var log;
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var SchedulePush = require(path.join(__dirname, "push.js"));
var match = require(path.join(__dirname, 'matchCollection.js'));
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/GPL';

if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

var onConnect = function (err, db)
{
    if (err)
    {
        console.log('Error: ', err.message);
    }
    else
    {
        var collection = db.collection(match);
        var onFetch = function (err, count)
        {
            db.close();
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                var day, t, j, i, schedule, match;
                var onInsert = function (err, doc)
                {
                    console.log(err ? err.message : doc.ops);
                };
                for (day = 1; day < 8; ++day)
                {
                    schedule = [];
                    switch (day < 5)
                    {
                        case true:
                            for (i = 1; i <= count / 2; ++i)
                            {
                                t = (i + day - 1 + count / 2) % (count + 1);
                                match =
                                {
                                    "_id": i,
                                    "Team_1": i,
                                    "Team_2": (t > count / 2 ? t : (i + day - 1)),
                                    "commentary": [],
                                    "scorecard": [],
                                    "MoM" : {}
                                };
                                schedule.push(match);
                            }
                            SchedulePush.insert(schedule, "matchday" + day, onInsert);
                            break;
                        default:
                            switch (day % 2)
                            {
                                case 1:
                                    var num = 0;
                                    t = Math.pow(2, +(day < 7));
                                    for (i = 0; i < 2; ++i)
                                    {
                                        for (j = 1; j <= count * t / 4; j += t)
                                        {
                                            match =
                                            {
                                                "_id": ++num,
                                                "Team_1": (count / 2) * i + j,
                                                "Team_2": (count / 2) * i + j + Math.pow((count / 4), +(day > 5)),
                                                "commentary": [],
                                                "scorecard": [],
                                                "MoM" : {}
                                            };
                                            schedule.push(match);
                                        }
                                    }
                                    SchedulePush.insert(schedule, "matchday" + day, onInsert);
                                    break;
                                default:
                                    for (i = 0; i < 2; ++i)
                                    {
                                        for (j = 1; j <= count / 4; ++j)
                                        {
                                            t = 2 * ((count / 4) * i + j) - 1;
                                            match =
                                            {
                                                "_id": (count / 4) * i + j,
                                                "Team_1": t,
                                                "Team_2": ((count * (2 * i + 1)) / 2 + 1 - t),
                                                "commentary": [],
                                                "scorecard": [],
                                                "MoM" : {}
                                            };
                                            schedule.push(match);
                                        }
                                    }
                                    SchedulePush.insert(schedule, "matchday" + day, onInsert);
                                    break;
                            }
                            break;
                    }
                }
            }
        };
        collection.count(onFetch);
    }
};
MongoClient.connect(mongoUri, onConnect);