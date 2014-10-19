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

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

var SchedulePush = require("./SchedulePush.js");

var callback=function(err,arg)
{
    if(err) console.log(err.message);
    else console.log(arg);
};
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
            var collection = db.collection('round3');

            var onFetch = function (err, count)
            {
                db.close();
                if (err)
                {
                    console.log(err.message);
                    callback(err, null);
                }
                else
                {
                    console.log(count);

                    var arr = [], match_count = 1, j;
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

                    for (i = 1; i <= count; i = i + 2)
                    {
                        j = i + 1;
                        arr[i] = match_count;
                        arr[j] = match_count;
                        var match =
                        {
                            "_id": match_count,
                            "Team_1": i,
                            "Team_2": j,
                            "TimeStamp": new Date("9 Sep 2014 00:00:00 +0530 (IST)"),
                            "commentary": [],
                            "scorecard":[]
                        };
                        match_count++;

                        SchedulePush.insert(match, "matchday1", onInsert)
                    }


                    for (var i = 1; count >= i; ++i)
                    {
                        console.log(arr[i]);

                    }


                    callback(null,true);
                }
            };
            collection.count(onFetch);
        }

    };
    MongoClient.connect(mongoUri, onConnect);

};