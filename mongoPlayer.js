/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 27/7/14.
 */


var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';


exports.fetchPlayers = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err) callback(err);
        else
        {
            var collection = db.collection('players');
            var onFetch = function (err, documents)
            {
                if (err) callback(err, null);
                else if (documents)
                {
                    db.close();

                    callback(true, null);

                }
                else callback(true, null);
            };
            var cursor = collection.find({});
            documents=cursor.toArray();

        }
    };
    MongoClient.connect(mongoUri, onConnect);
};