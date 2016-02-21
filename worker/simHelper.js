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

var async = require('async');

exports.rand = function (base, limit)
{
    if (limit)
    {
        return base + ((limit > base) ? rand(limit - base) : 0);
    }
    else if (base)
    {
        return ((typeof(base) === 'object') ? base[rand(base.length)] : parseInt(Math.random() * 1000000000000000, 10) % base);
    }
    else
    {
        return Math.random();
    }
};

exports.getAllMatches = function (err, callback)
{
    var collection;
    switch (days.indexOf(day))
    {
        case -1:
            throw 'Invalid Day';
        default:
            collection = 'matchday' + day;
            break;
    }

    database.collection(collection).find().toArray(callback)
};

exports.ForAllMatches = function (err, docs)
{
    if (err)
    {
        console.error(err.message);

        if (log)
        {
            log.log('debug', {Error: err.message});
        }

        throw err;
    }
    else
    {
        async.map(docs, forEachMatch, onFinish);
    }
};

exports.onGetInfo = function (err, doc)
{
    if (err)
    {
        console.error(err.message);
    }
    else
    {
        stats = doc;
        getAllMatches(err, ForAllMatches);
    }
};

exports.getEachRating = function (elt, subCallback)
{
    database.collection('players').find({_id: elt}).limit(1).next(subCallback);
};