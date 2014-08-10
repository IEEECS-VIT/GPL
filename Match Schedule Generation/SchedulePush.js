/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 10/8/14.
 */


var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';


exports.insert = function (doc,collection_recieved, callback) {
    var onConnect = function (err, db) {
        if (err) {
            callback(err);
        }
        else {
            var collection = db.collection(collection_recieved);
            var onInsert = function (err, docs) {
                db.close();
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, docs);
                }
            };
            collection.insert(doc, {w: 1}, onInsert);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};