/**
 * Created by Amol on 12-Aug-2014.
 */
var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';


exports.getTeam = function (doc,callback ) {
    var onConnect = function (err, db) {
        if (err) {
            callback(err);
        }
        else {
            var collection = db.collection('team');                     // i dont know the exact collection name, i have assumed it
            var onFetch = function (err, document) {
                if (err) {
                    callback(err, null);
                }
                else if (document) {
                    db.close();
                    if (doc['_id'] === document['_id']) {
                        callback(null, doc);
                    }
                    else {
                        callback(true, null);
                    }

                }
                else {
                    callback(true, null);
                }
            };
            collection.findOne(doc, onFetch);                       // i don't understand this line .. need help in this
        }
    };
    MongoClient.connect(mongoUri, onConnect);
}