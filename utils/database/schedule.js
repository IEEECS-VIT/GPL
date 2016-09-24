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

console.time("Schedule construction");

var i,
	j,
	day,
	num,
	temp,
	users,
	excess,
	size = 0,
	done = 0,
	database,
	schedule,
	mongoURI,
	mode = "",
	count = 0,
	unassigned,
	schedulerCallback,
	path = require("path"),
	async = require("async"),
	Heroku = require("heroku-client"),
	mongo = require("mongodb").MongoClient.connect,
	generate = require(path.join(__dirname, "..", "..", "database", "mongoRecord")).users,
	init = () => {
        // eslint-disable-next-line lodash/prefer-lodash-method
		database.collection(process.env.MATCH).find({ authStrategy: { $ne: "admin" } }, { _id: 1 }).toArray(onFetch);
	};

try {
	mode = testFlag ? "test" : "";
}
catch (err) {
	console.log("Running in non-test mode.");
}

if (process.env.NODE_ENV) {
	mongoURI = process.env.MONGO;
    // var configure = new Heroku({token: process.env.HEROKU_API_TOKEN}).apps(process.env.HEROKU_APP_NAME).configVars().update;
}
else {
    // set process.env.MONGO in .env, avoid using arbitrary values directly
	require("dotenv").load({ path: path.join(__dirname, "..", "..", ".env") }); // eslint-disable-line global-require
}

mongoURI = process.env.MONGO;

if (process.env.DAY < "0") {
	throw new Error("Registrations have not started yet, set process.env.DAY to 0 to allow registration.");
}
else if (process.env.DAY > "0") {
	throw new Error("Matches for this round have already started.");
}

var onInsert = function (err, doc) {
		if (err) {
			throw err;
		}
		if (!mode) {
			console.log(doc.ops);
		}
		if (++done === 7) {
			schedulerCallback(null);
		}
	},
	padTeams = function (asyncCallback) {
		if (users.length) {
			database.collection(process.env.MATCH).insertMany(users, asyncCallback);
		}
		else {
			asyncCallback(null);
		}
	},
	setTeamNumber = function (asyncCallback) {
		var forEach = function (arg, callback) {
			database.collection(process.env.MATCH).updateOne({ _id: arg._id }, { $set: { teamNo: ++size } },
                callback);
		};

		async.map(unassigned, forEach, asyncCallback);
	},
	genSchedule = function (asyncCallback) {
		schedulerCallback = asyncCallback;

		for (day = 1; day < 8; ++day) {
			schedule = [];

			switch (day) {
			case 1:
			case 2:
			case 3:
			case 4:
				for (i = 1; i <= count / 2; ++i) {
					temp = (i + day - 1 + count / 2) % (count + 1);

					schedule.push({
						_id: i,
						Team_1: i, // eslint-disable-line camelcase
						Team_2: temp > count / 2 ? temp : i + day - 1, // eslint-disable-line camelcase
						MoM: {},
						overs: [],
						scorecard: [],
						commentary: []
					});
				}

				break;

			case 5:
			case 7:
				num = 0;
				temp = Math.pow(2, Number(day < 7));

				for (i = 0; i < 2; ++i) {
					for (j = 1; j <= count * temp / 4; j += temp) {
						schedule.push({
							_id: ++num,
							Team_1: (count / 2) * i + j, // eslint-disable-line camelcase
                             // eslint-disable-next-line camelcase
							Team_2: (count / 2) * i + j + Math.pow(count / 4, Number(day > 5)),
							MoM: {},
							overs: [],
							scorecard: [],
							commentary: []
						});
					}
				}

				break;

			case 6:
				for (i = 0; i < 2; ++i) {
					for (j = 1; j <= count / 4; ++j) {
						temp = 2 * ((count / 4) * i + j) - 1;

						schedule.push({
							_id: (count / 4) * i + j,
							Team_1: temp, // eslint-disable-line camelcase
							Team_2: (count * (2 * i + 1)) / 2 + 1 - temp, // eslint-disable-line camelcase
							MoM: {},
							overs: [],
							scorecard: [],
							commentary: []
						});
					}
				}

				break;
			default: break;
			}

			database.collection(`matchday${day}`).insertMany(schedule, { w: 1 }, onInsert);
		}
	},
	onParallel = function (err) {
		if (err) {
			throw err;
		}

		console.timeEnd("Schedule construction");

		if (mode) {
			global.testHelperCallback(); // from tests/helper.js
		}
		else {
			database.close();

            /* if(process.env.NODE_ENV)
    	    {
    		    configure({DAY: 1}, function(error){ // update process.env.DAY to 1, indicating that matches can start.
    			    if(error)
    			    {
    				    console.error(error.message);
    			    }
    			    else
    			    {
    				    console.log("process.env.DAY has been updated to 1.");
    			    }
    		    });
    	    }*/
		}
	},
	parallelTasks = [padTeams, genSchedule, setTeamNumber],
	onFetch = function (err, results) {
		if (err) {
			throw err;
		}

		unassigned = results;
		count = unassigned.length;
		excess = (8 - count % 8) % 8;
		users = generate(false, excess, count);
		count += excess;

		async.parallel(parallelTasks, onParallel);
	};

if (mode) {
	database = testDb; // from utils/database/seed.js
	init();
}
else {
	var onConnect = function (err, db) {
		if (err) {
			throw err;
		}

		database = db;
		init();
	};

	mongo(mongoURI, onConnect);
}
