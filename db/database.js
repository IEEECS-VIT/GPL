var mongo = require('mongodb').MongoClient.connect;
var database;

module.exports = function(callback)
{
      if(database)
      {
          callback(null, database);
      }
      else
      {
          mongo(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/GPL', function(err, db)
          {
              if(err)
              {
                  throw err;
              }
              else
              {
                  database = db;
                  callback(null, db);
              }
          });
      }
};