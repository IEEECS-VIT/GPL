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

var scaleRef = {
		KB: 1024,
		MB: 1048576
	},
	forgotRef =
	{
		user: {
			user: 1
		},
		password: {
			password: 1
		}
	},
	value,
	match = process.env.MATCH,
	path = require("path").join,
	mongoFeatures = require(path(__dirname, "mongoFeatures"));

if (!process.env.NODE_ENV) {
	value = require("faker").commerce.price; // eslint-disable-line global-require
}

exports.scale = function (data, level) {
	return (data / scaleRef[level]).toFixed(2) + level;
};

exports.parse = function (mode, lower, upper) {
	return Number[`parse${mode}`]((value() % (upper - lower + 1) + lower).toFixed(2), 10);
};

exports.forgotCallback = function (mode, callback) {
	return (err) => {
		if (err) {
			return callback(err);
		}

		return mongoFeatures.forgotCount(forgotRef[mode], callback);
	};
};

exports.shortlistRef =
{
	users: {
		out: "round2",
		limit: parseInt(process.env.ONE, 10)
	},
	round2: {
		out: "round3",
		limit: 8
	},
	round3: {
		out: null,
		limit: 8
	}
};

exports.getData = function (team, slice, callback) {
	db.collection(match).find(team, slice).limit(1).next(callback);
};
