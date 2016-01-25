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

var log;
var path = require('path');
var mongo = require('mongodb').MongoClient.connect;

if(!process.env.NODE_ENV)
{
    require('dotenv').load({path : path.join(__dirname, '..', '.env')});
}
if (process.env.LOGENTRIES_TOKEN)
{
    log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}

var match = process.env.MATCH;
var mongoUri = process.env.MONGO;

var onConnect = function (err, database)
{
    if (err)
    {
        console.log('Error: ', err.message);
    }
    else
    {
        var onFetch = function (err, count)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                var i;
                var j;
                var day;
                var temp;
                var done = 0;
                var schedule;

                var onInsert = function (err, doc)
                {
                    if(err)
                    {
                        throw err;
                    }
                    else
                    {
                        console.log(doc.ops);

                        if(++done == 7)
                        {
                            database.close();
                        }
                    }
                };

                for (day = 1; day < 8; ++day)
                {
                    schedule = [];

                    switch (day < 5)
                    {
                        case true:
                            for (i = 1; i <= count / 2; ++i)
                            {
                                temp = (i + day - 1 + count / 2) % (count + 1);

                                schedule.push({
                                    "_id": i,
                                    "Team_1": i,
                                    "Team_2": (temp > count / 2 ? temp : (i + day - 1)),
                                    "commentary": [],
                                    "scorecard": [],
                                    "MoM": {}
                                });
                            }

                            break;
                        default:
                            switch (day % 2)
                            {
                                case 1:
                                    var num = 0;
                                    temp = Math.pow(2, +(day < 7));

                                    for (i = 0; i < 2; ++i)
                                    {
                                        for (j = 1; j <= count * temp / 4; j += temp)
                                        {
                                            schedule.push({
                                                "_id": ++num,
                                                "Team_1": (count / 2) * i + j,
                                                "Team_2": (count / 2) * i + j + Math.pow((count / 4), +(day > 5)),
                                                "commentary": [],
                                                "scorecard": [],
                                                "MoM": {}
                                            });
                                        }
                                    }

                                    break;
                                default:
                                    for (i = 0; i < 2; ++i)
                                    {
                                        for (j = 1; j <= count / 4; ++j)
                                        {
                                            temp = 2 * ((count / 4) * i + j) - 1;

                                            schedule.push({
                                                "_id": (count / 4) * i + j,
                                                "Team_1": temp,
                                                "Team_2": ((count * (2 * i + 1)) / 2 + 1 - temp),
                                                "commentary": [],
                                                "scorecard": [],
                                                "MoM": {}
                                            });
                                        }
                                    }

                                    break;
                            }
                    }

                    database.collection("matchday" + day).insertMany(schedule, {w : 1}, onInsert);
                }
            }
        };

        database.collection(match).count({authStrategy : {$ne : 'admin'}}, onFetch);
    }
};

mongo(mongoUri, onConnect);