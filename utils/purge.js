console.time('Purge operation');

var path = require('path').join;
var mongo = require('mongodb').MongoClient.connect;

if(process.env.NODE_ENV)
{
    throw 'The database may not be purged on production environments.';
}
else
{
    require('dotenv').load({path: path(__dirname, '..', '.env')})
}

mongo(process.env.MONGO, function(err, db){
    if(err)
    {
        console.log(err.message);
    }
    else
    {
        db.dropDatabase({}, {_id: 1}).toArray(function(err, result){
            if(err)
            {
                console.error(err.message);
            }
            else
            {
                db.close();
                console.log(result);
                console.log('The database was successfully purged, you can reinstate it with `npm run seed`.');
                console.timeEnd('Purge operation');
            }
        });
    }
});