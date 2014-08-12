/**
 * Created by Amol on 12-Aug-2014.
 */


// i dont know much about mongo db and database connectivity.
    // please let me know, where i have made a mistake, so that i can correct the changes... :)


var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

exports.fetchSquad = function (callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            var collection = db.collection('squad');
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