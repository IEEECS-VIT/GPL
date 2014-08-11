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

                    var arr = [], match_count = 1,j=0;
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

                    for ( var i = 0; i < count/8;i++)
                    {
                        var team1=[1,2,3,4];
                        var team2=[7,5,6,8];

                        for(j=0;j<team1.length;j++)
                        {
                            arr[8*i+team1[j]] = match_count;
                            arr[8*i+team2[j]] = match_count;
                            var match =
                            {
                                "_id": match_count,
                                "Team 1": i,
                                "Team 2": j,
                                "TimeStamp": "Day 3"
                            };
                            match_count++;
                            SchedulePush.insert(match,"matchday3",onInsert)

                        }
                    }
                }
            }
            collection.count(onFetch);
        }

    }
    MongoClient.connect(mongoUri, onConnect);


}