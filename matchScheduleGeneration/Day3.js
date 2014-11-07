/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 10/8/14.
 */

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
var MongoClient = require('mongodb').MongoClient;
var match = require('matchCollection');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

var SchedulePush = require("./SchedulePush.js");


exports.gen_schedule = function ()
{


    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            var collection = db.collection(match);

            var onFetch = function (err, count)
            {
                db.close();
                if (err)
                {
                    console.log("Error");
                    callback(err, null);
                }
                else
                {
                    console.log(count);

                    var match_count = 1, j = 0;
                    var onInsert = function (err, docs)
                    {
                        if (err)
                        {
                            console.log("Error")
                        }
                        else
                        {
                            console.log(docs)
                        }
                    };

                    for (var i = 0; i < count / 8; i++)
                    {
                        var team1 = [1, 2, 3, 4];
                        var team2 = [7, 5, 6, 8];

                        for (j = 0; j < team1.length; j++)
                        {
                            var match =
                            {
                                "_id": match_count,
                                "Team_1": 8 * i + team1[j],
                                "Team_2": 8 * i + team2[j],
                                "TimeStamp": new Date("11 Sep 2014 00:00:00 +0530 (IST)"),
                                "commentary": []
                            };
                            match_count++;
                            SchedulePush.insert(match, "matchday3", onInsert)

                        }
                    }
                }
            };
            collection.count(onFetch);
        }

    };
    MongoClient.connect(mongoUri, onConnect);
};