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
        console.error(err.message);
    }
    else
    {
        db.dropDatabase(function(err){
            if(err)
            {
                console.error(err.message);
            }
            else
            {
                db.close();
                console.log('The database was successfully purged, you can reinstate it with `npm run seed`.');
                console.timeEnd('Purge operation');
            }
        });
    }
});