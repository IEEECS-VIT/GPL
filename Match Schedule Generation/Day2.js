/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 10/8/14.
 */

var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

var SchedulePush = require("./SchedulePush.js");


exports.gen_schedule=function()
{


    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            var collection = db.collection('users');

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

                    var arr = [], match_count = 1,j;
                    var onInsert = function(err,docs)
                    {
                        if(err)
                        {
                            console.log("Error")
                        }
                        else
                        {
                            console.log(docs)
                        }
                    }

                    for (var i = 1; i <= count;)
                    {
                        j = i + 2;
                        arr[i] = match_count;
                        arr[j] = match_count;
                        var match =
                        {
                            "_id": match_count,
                            "Team 1": i,
                            "Team 2": j,
                            "TimeStamp": "Day 1"
                        };
                        match_count++;
                        i++;
                        if (i % 2 == 0)
                        {
                            i*=2;
                        }


                        SchedulePush.insert(match,"matchday2",onInsert)
                    }


                    for (var i = 1; count >= i; ++i)
                    {
                        console.log(arr[i]);

                    }


                    //callback(null,true);
                }
            }
            collection.count(onFetch);
        }

    }
    MongoClient.connect(mongoUri, onConnect);


}