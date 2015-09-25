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