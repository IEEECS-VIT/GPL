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

var i,
	match,
	stats,
	points = 0,
	onGetRating,
	parallelTasks,
	async = require("async"),
	path = require("path").join,
	helper = require(path(__dirname, "simControlHelper"));
	// email = require(path(__dirname, "..", "utils", "email", "email"));

if (!process.env.NODE_ENV) {
	require("dotenv").load({ path: path(__dirname, "..", ".env") }); // eslint-disable-line global-require
}

match = process.env.MATCH;
// email.match.header.bcc = [];

exports.initSimulation = function (day, masterCallback) {
	var forEachMatch = function (matchDoc, callback) {
			var getTeamDetails = function (query, asyncCallback) {
					var getRating = function (err, userDoc) {
						if (err) {
							throw err;
						}
						if (userDoc.squad.length < 11) {
							userDoc.ratings = [];
							asyncCallback(err, userDoc);
						}
						else {
							onGetRating = helper.onGetRating(userDoc, asyncCallback);
							userDoc.squad.push(userDoc.team.filter((elt) => { return elt > "d"; })[0]);
							async.map(userDoc.squad, helper.getEachRating, onGetRating);
						}
					};

					global.database.collection(match).find(query).limit(1).next(getRating);
				},
				totals = function (newUserDoc) {
					if (newUserDoc.scores[day - 1] > stats.daily.total.value) {
						stats.daily.total = helper.dailyTotal(newUserDoc, day);
					}
					if (newUserDoc.highestTotal > stats.high.total.value) {
						stats.high.total = helper.total(newUserDoc, "high");
					}
					if (newUserDoc.lowestTotal < stats.low.value) {
						stats.low = helper.total(newUserDoc, "low");
					}
				},
				nonBowler = function (newUserDoc) {
					if (!newUserDoc.squad[i].match(/^b/) && !newUserDoc.squad[i].match(/^d/)) {
						if (newUserDoc.stats[newUserDoc.squad[i]].recent[day - 1] > stats.daily.individual.value) {
							stats.daily.individual = helper.dailyHigh(newUserDoc, i, day);
						}
						if (newUserDoc.stats[newUserDoc.squad[i]].high > stats.high.individual.value) {
							stats.high.individual = helper.overallHigh(newUserDoc, i);
						}
						if (newUserDoc.stats[newUserDoc.squad[i]].runs > stats.orange.runs) {
							stats.orange = helper.orangeCap(i, newUserDoc);
						}
					}
				},
				updateData = function (newData) {
					var updateUser = function (newUserDoc, asyncCallback) {
							if (newUserDoc.squad.length) {
								stats.general = helper.generalStats(stats.general, newUserDoc, day);
								totals(newUserDoc);

								for (i = 0; i < newUserDoc.squad.length; ++i) {
									nonBowler(newUserDoc);


									if (newUserDoc.squad[i].match(/^[^a]/) &&
                                    !newUserDoc.squad[i].match(/^d/) &&
                                    newUserDoc.stats[newUserDoc.squad[i]].wickets > stats.purple.wickets) {
										stats.purple = helper.purpleCap(i, newUserDoc);
									}
								}
							}

							delete newUserDoc.f;
							delete newUserDoc.s;
							delete newUserDoc.names;

                            // eslint-disable-next-line no-underscore-dangle
							global.database.collection(match).updateOne({ _id: newUserDoc._id }, newUserDoc,
                                asyncCallback);
						},
						updateMatch = function (newMatchDoc, asyncCallback) {
							if (points < (newMatchDoc.MoM.points || 0)) {
								points = newMatchDoc.MoM.points;
								stats.daily.MoM = newMatchDoc.MoM;
							}

							global.database.collection(`matchday${day}`)// eslint-disable-next-line no-underscore-dangle
                                .updateOne({ _id: newMatchDoc._id }, newMatchDoc, asyncCallback);
						},
						parallelTasks2 = helper.userParallelTasks(newData, updateUser, updateMatch);

                    // eslint-disable-next-line no-underscore-dangle
					console.log(`${newData.team1._id} v ${newData.team2._id} (Updating match ${newData.match._id})`);
					async.parallel(parallelTasks2, callback);
				},
				onTeamDetails = helper.onTeamDetails(matchDoc, updateData);

			parallelTasks = helper.teamParallelTasks(getTeamDetails, matchDoc);
			async.parallel(parallelTasks, onTeamDetails);
		},
		onFinish = function (err, results) {
			if (err) {
				throw err;
			}

			var onUpdate = helper.onUpdate(results, masterCallback);

			global.database.collection("stats").updateOne({ _id: "stats" }, { $set: stats }, onUpdate);
		},
		forAllMatches = helper.forAllMatches(forEachMatch, onFinish),
		onGetInfo = function (err, doc) {
			if (err) {
				throw err;
			}

			stats = doc;
			stats.daily.total.value = stats.daily.individual.value = stats.daily.MoM.points = 0;
			helper.getAllMatches(day, forAllMatches);
		};

	global.database.collection("stats").find().limit(1).next(onGetInfo);
};
