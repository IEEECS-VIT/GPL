/*
 *  GraVITas Premier League
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
var path = require('path');

var mongoPlayers = require(path.join(__dirname, '..', 'db', 'mongo-players'));

exports.playersTest = function (players, asyncCallback)
{
    var getCost = function (id, callback)
    {
        var onFetch = function (err, document)
        {
            if (err)
            {
                //do something with the error
                callback(err, null);
            }
            else
            {
                callback(false, document);
            }
        };
        var player = {
            _id: id
        };
        mongoPlayers.getPlayer(player, onFetch)
    };
    var onFinish = function (err, documents)
    {
        if (err)
        {
            // do something with the error
            asyncCallback(err, null);
        }
        else
        {
            asyncCallback(false, documents);
        }
    };
    async.map(players, getCost, onFinish);
};