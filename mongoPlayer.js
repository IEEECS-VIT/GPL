/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 27/7/14.
 */


var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';


exports.fetchPlayers = function (callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            var collection = db.collection('players');
            var onFetch = function (err, documents)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    callback(null, documents);
                }
            };
            collection.find({}).toArray(onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};