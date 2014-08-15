/**
 * Created by Amol on 12-Aug-2014.
 */

var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

var getPlayer=function(id, callback)
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
            var onFetch = function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    callback(false, document);
                }
            };
            collection.findOne({_id: id}, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);

};

exports.getTeam = function (doc, callback)
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
            /*
            var documents = [];
            var onGetPlayer = function(err, documents)
            {
                if(err)
                {
                    callback(err,null);
                }
                else
                {
                    documents.push(document);
                }
            };
            var addDocument = function(data, asyncCallback)
            {
                var credentials = {
                    "_id" : data
                };
                getPlayer(credentials, asyncCallback);
            };
            */
            var onFetch = function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    async.map(document.team, getPlayer, callback);
                    // document.team.forEach(addDocument);
                    // callback(false, documents);
                }
            };
            collection.findOne(doc, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};
