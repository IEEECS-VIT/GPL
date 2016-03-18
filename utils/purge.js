/*
 *  GraVITas Premier League <gravitaspremierleague@gmail.com>
 *  Copyright (C) 2014  IEEE Computer Society - VIT Student Chapter <ieeecs@vit.ac.in>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

console.time('Purge operation');

var mode = '';

try
{
    mode = testFlag ? 'test' : ''; //  testFlag is a global variable from tests/helper.js
}
catch(err)
{
    console.log('Running in non-test mode.');
}

var path = require('path').join;
var mongo = require('mongodb').MongoClient.connect;
var mongoURI = `mongodb://127.0.0.1:27017/${mode}GPL`;

if(process.env.NODE_ENV)
{
    throw 'The database may not be purged on production environments.';
}

mongo(mongoURI, function(err, db){
    if(err)
    {
        throw err;
    }

    db.dropDatabase(function(error){
        if(error)
        {
            throw error;
        }

        console.log('The database was successfully purged, you can reinstate it with `npm run seed`.');
        console.timeEnd('Purge operation');

        if(mode)
        {
            testDb = db; // to maintain a persistent test database connection
            require(path(__dirname, 'seed'));
        }
        else
        {
            db.close();
        }
    });
});
