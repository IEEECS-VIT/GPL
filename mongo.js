/**
 * Created by Aneesh Neelam <neelam.aneesh@gmail.com> on 2/7/14.
 */

var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

exports.insert = function (doc, callback) {
    var onConnect = function (err, db) {
        if (err) callback(err);
        else {
            var collection = db.collection('users');
            var onInsert = function (err, docs) {
                db.close();
                if (err) callback(err, null);
                else {
                    callback(null, docs);
                }
            };
            collection.insert(doc, {w: 1}, onInsert);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.auth = function (doc, callback) {
    var onConnect = function (err, db) {
        if (err) callback(err);
        else {
            var collection = db.collection('users');
            var onFetch = function (err, document) {
                if (err) callback(err, null);
                else if (document) {
                    db.close();
                    if (doc['_id'] === document['_id'] && doc['password_hash'] === document['password_hash']) {
                        callback(null, doc);
                    }
                    else {
                        callback(true, null);
                    }
                }
                else callback(true, null);
            };
            collection.findOne(doc, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.fetch = function (doc, callback) {
    var onConnect = function (err, db) {
        if (err) callback(err);
        else {
            var collection = db.collection('users');
            var onFetch = function (err, document) {
                if (err) callback(err, null);
                else if (document) {
                    db.close();
                    if (doc['_id'] === document['_id']) {
                        callback(null, doc);
                    }
                    else {
                        callback(true, null);
                    }

                }
                else callback(true, null);
            };
            collection.findOne(doc, onFetch);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};