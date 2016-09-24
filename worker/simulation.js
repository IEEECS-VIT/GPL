/*
 *  GraVITas Premier League <gravitaspremierleague@gmail.com>
 *  Copyright (C) 2014  I.E.E.E Computer Society - VIT Student Chapter <ieeecs@vit.ac.in>
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
"use strict";

/* eslint-disable security/detect-object-injection */
/* eslint-disable no-implicit-coercion */
/* eslint-disable max-statements */

var helper = require(require("path").join(__dirname, "simHelper")), // loads a collection of helper functions
	rand = helper.rand, // random number generator
	genArray = helper.genArray, // returns an array / matrix of zeroes with the specified dimension
	MoM, // the object to denote the man of the match
	strike, // an array to denote the batting positions of the two playing batsman at the crease.
	key = helper.key, // a reference object for team property updates.
	result = helper.result, // a reference object to decide victory or loss.
	scale = helper.scale, // processes values to appropriate floating point precision
	total = [0, 0], // the total runs scored by the team in it's innings.
	wickets = [0, 0], // the total wickets lost by the team in it's innings.
	desperation = [], // the extent of playing desperation, tracked for the two current batsmen on strike.
	bat = helper.bat, // decrease to strengthen batting.
	overs = [120, 120], // the number of balls faced by each team. Is adjusted when an innings completes in less than 20 overs.
	bowl = helper.bowl, // increase to strengthen bowling.
	lastFiveOvers = [], // stores the runs scored in the last five overs.
	wicketSequence = [], // stores the details of each dismissal.
	frustration = [0, 0], // stores the extent of frustration, which can change depending on the dot balls played by the current two batsmen.
	score = genArray(11), // runs scored by each batsman. Reset after the innings is complete.
	balls = genArray(11), // balls faced by each batsman. Reset after the innings is complete.
	fours = genArray(11), // number of fours hit by each batsman. Reset after the innings is complete.
	control = genArray(11), // the extent of innings control shown by each batsman. Reset after the innings is complete.
	catches = genArray(11), // the number of catches taken by each bowler. Reset after the innings is complete.
	maidens = genArray(11), // the number of maiden overs bowled by each bowler. Reset after the innings is complete.
	maximums = genArray(11), // the number of sixes hit by each batsman. Reset after the innings is complete.
	dotBalls = genArray(11), // the number of dot balls faced by each member of the batting side. Reset after the innings is complete.
	dismissed = genArray(11), // an array of flags to denote whether a batsman was dismissed or not. Reset after the innings is complete.
	milestone = genArray(11), // an array of flags to denote whether a batsman got to a 50 / 100. Reset after the innings is complete.
	deliveries = genArray(11), // the number of balls bowled by each bowler. Reset after the innings is complete.
	runsConceded = genArray(11), // the number of runs conceded by each bowler. Reset after the innings is complete.
	wicketsTaken = genArray(11), // the number of wickets taken by each bowler. Reset after the innings is complete.
	dotDeliveries = genArray(11), // the number of dot balls bowled by each bowler. Reset after the innings is complete.
	fiveWicketHaul = genArray(11), // an array of flags to denote whether or not any bowler attained a 5 wicket haul. Reset after the innings is complete.
	ballMatrix = genArray(11, 11), // a matrix that denotes the number of balls faced by each batsman, per bowler. Reset after the innings is complete.
	partnershipRuns = genArray(10), // the number of runs score per wicket partnership. Reset after the innings is complete.
	partnershipBalls = genArray(10), // the number of balls faced in each wicket partnership. Reset after the innings is complete.
	continuousWickets = genArray(11), // the number of continuous wickets taken by each bowler. Reset after the innings is complete.
	i, // loop control variable for overs in an innings.
	j, // loop control variable for deliveries in an over.
	toss, // denotes which team won the toss.
	loop, // loop control variable for each innings.
	team, // the team object, contains adjusted player ratings.
	temp, // dummy variable for holding temporary values in otherwise complicated calculations.
	dot = 0, // the number of dot balls in each innings. Reset after the innings is complete.
	batIndex, // denotes the batting stroke result for the current ball. Reset after the innings is complete.
	bowlIndex, // denotes the bowling delivery result for the current ball. Reset after the innings is complete.
	tossIndex, // a copy of toss used to switch back and forth between bowling and batting teams, flipped after the first innings.
	extras = 0, // the number of wides / no-balls bowled in the innings. Reset after the innings is complete.
	winner = -1, // denotes the index of the team that won the match. Set to -1 in a tie.
	hope = true, // a boolean flag to denote whether the required run rate is less than 36.
	freeHit = 0, // used to denote whether the current delivery is a free-hit or not. Reset after the innings is complete.
	strikeIndex, // used as the index of the array strike, to rotate strike between the two current batsmen at the crease. Reset after the innings is complete.
	// currentOver, // stores commentary for the current over. Unused presently.
	wicketIndex, // denotes the mode of dismissal, as a reference for commentary. Reset after the innings is complete.
	boundaryGap, // denotes the number of balls since the last 4 / 6 was hit. Reset after the innings is complete.
	// currentBall, // stored commentary for the current ball. unused presently.
	fallOfWicket, // denotes the score and the ball at which the previous wicket fell. Reset after the innings is complete.
	deliveryScore, // used to decide the result of the current ball. Reset after the innings is complete.
	currentBowler, // denotes the index of the current bowler. Reset after the innings is complete.
	previousBowler, // denotes the index of the previous bowler. set to -1 by default. Reset after the innings is complete.
	previousOver = 0, // denotes the number of runs scored in the previous over. Reset after the innings is complete.
	continuousMaximums, // denotes the number of consecutive sixes hit in the current innings. Reset after the innings is complete.
	previousBatsman = -1, // denotes the batting position of the previous batsman. Reset after the innings is complete.
	previousDismissal = -1, // stores the index of the bowler who got the previous wicket. Set to -1 for run-outs.
	currentPartnership = 0, // denotes the index of the current partnership.
	hinge = (arg) => {
		return arg && overs || wickets;
	}, // use wickets or overs to decide match winner if totals are equal
	pickBowler = (arg, index) => {
		return (arg < 19) && (index !== previousBowler);
	}, // Used to select the bowler for the next over.
	batMoM = (prev, curr, index) => prev + curr * team[+!tossIndex].bowlRating[index], // calculates the weighted difficulty rating for the given batsman.
	bowlMoM = (position) => {
		return (prev, curr, index) => prev + curr[position] * team[+tossIndex].batRating[index];
	}, // calculates weighted difficulty rating for the given bowler.
	partnership = () => {
		return `Partnership: ${partnershipRuns[currentPartnership]} (${partnershipBalls[currentPartnership]}), Run rate: ${scale(partnershipRuns[currentPartnership], partnershipBalls[currentPartnership], 6)}`;
	};

exports.simulate = function (data, callback) {
	console.time("sim"); // begin simulation benchmarking
	console.log(`${data.team[0]._id} vs ${data.team[1]._id}`); // eslint-disable-line no-underscore-dangle
	data.team[0].names = ["", "", "", "", "", "", "", "", "", "", ""];
	data.team[1].names = ["", "", "", "", "", "", "", "", "", "", ""];
	temp = [data.team[0].ratings.length > 11, data.team[1].ratings.length > 11];
	// eslint-disable-next-line no-negated-condition
	if (!(temp[0] && temp[1])) { // simplified check to determine which team lost / won if at least 1 team is short of 11 players and one coach.
		for (i = 0; i < 2; ++i) {
			++data.team[i][result[temp[i]].state]; // increment win / loss
			data.team[i].points += result[temp[i]].points; // adjust points in accordance with above
		}
	}
	else { // if both teams have a valid playing eleven and a coach set.
		total = [0, 0];
		wickets = [0, 0];
		toss = rand(2); // decide which team wins the toss.
		data.match.overs = []; // temporary array to hold over wise commentary objects
		++data.team[toss].toss; // updates the number of successful tosses for the team
		data.match.count = [0, 0]; // set the number of bowlers used per team to zero
		data.match.scorecard = [];
		data.match.commentary = [];
		tossIndex = toss ^ rand(2); // decide whether to bat or bowl first.
		data.team[0].s = data.team[1].s = data.team[0].f = data.team[1].f = 0; // sets no. of fours and sixes in the match per team to 0
		temp = helper.make([data.team[0].ratings, data.team[1].ratings]); // construct teams.
		MoM = temp.MoM;
		team = temp.teams;
		temp = scale(team[0].meanRating, team[0].meanRating + team[1].meanRating, 100); // make dynamic
		// eslint-disable-next-line no-underscore-dangle
		data.match.commentary.push(`Match ${data.match._id}: ${data.team[0]._id} versus ${data.team[1]._id}`);
		// eslint-disable-next-line no-underscore-dangle
		data.match.commentary.push(`Winning chances: ${data.team[0]._id} : ${temp} % | % ${100 - temp} : ${data.team[1]._id}`);
		// eslint-disable-next-line no-underscore-dangle
		data.match.commentary.push(rand(helper.state[0]), `Toss: ${data.team[toss]._id} wins the toss and chooses to ${helper.toss[tossIndex ^ toss]}`);
		// eslint-disable-next-line no-underscore-dangle
		data.match.commentary.push("Batting orders:", [data.team[+tossIndex]._id, data.team[+!tossIndex]._id]);

		for (i = 0; i < 11; ++i) { // display batting orders
			data.match.commentary.push([team[+tossIndex].name[i] + team[+tossIndex].type[i], team[+!tossIndex].name[i] + team[+!tossIndex].type[i]]);
		}

		for (loop = 0; loop < 2; ++loop) { // loop through for two innings
			/*
			 * reset all variables that are to be reset every inning
			 */
			desperation = [0, 0]; // the extent of playing desperation, tracked for the two current batsmen on strike.
			overs = [120, 120]; // the number of balls faced by each team. Is adjusted when an innings completes in less than 20 overs.
			lastFiveOvers = []; // stores the runs scored in the last five overs.
			wicketSequence = []; // stores the details of each dismissal.
			frustration = [0, 0]; // stores the extent of frustration, which can change depending on the dot balls played by the current two batsmen.
			score = genArray(11); // runs scored by each batsman. Reset after the innings is complete.
			balls = genArray(11); // balls faced by each batsman. Reset after the innings is complete.
			fours = genArray(11); // number of fours hit by each batsman. Reset after the innings is complete.
			control = genArray(11); // the extent of innings control shown by each batsman. Reset after the innings is complete.
			catches = genArray(11); // the number of catches taken by each bowler. Reset after the innings is complete.
			maidens = genArray(11); // the number of maiden overs bowled by each bowler. Reset after the innings is complete.
			maximums = genArray(11); // the number of sixes hit by each batsman. Reset after the innings is complete.
			dotBalls = genArray(11); // the number of dot balls faced by each member of the batting side. Reset after the innings is complete.
			dismissed = genArray(11); // an array of flags to denote whether a batsman was dismissed or not. Reset after the innings is complete.
			milestone = genArray(11); // an array of flags to denote whether a batsman got to a 50 / 100. Reset after the innings is complete.
			deliveries = genArray(11); // the number of balls bowled by each bowler. Reset after the innings is complete.
			runsConceded = genArray(11); // the number of runs conceded by each bowler. Reset after the innings is complete.
			wicketsTaken = genArray(11); // the number of wickets taken by each bowler. Reset after the innings is complete.
			dotDeliveries = genArray(11); // the number of dot balls bowled by each bowler. Reset after the innings is complete.
			fiveWicketHaul = genArray(11); // an array of flags to denote whether or not any bowler attained a 5 wicket haul. Reset after the innings is complete.
			ballMatrix = genArray(11, 11); // a matrix that denotes the number of balls faced by each batsman, per bowler. Reset after the innings is complete.
			partnershipRuns = genArray(10); // the number of runs score per wicket partnership. Reset after the innings is complete.
			partnershipBalls = genArray(10); // the number of balls faced in each wicket partnership. Reset after the innings is complete.
			continuousWickets = genArray(11); // the number of continuous wickets taken by each bowler. Reset after the innings is complete.
			dot = 0; // the number of dot balls in each innings. Reset after the innings is complete.
			extras = 0; // the number of wides / no-balls bowled in the innings. Reset after the innings is complete.
			freeHit = 0; // used to denote whether the current delivery is a free-hit or not. Reset after the innings is complete.
			previousOver = 0; // denotes the number of runs scored in the previous over. Reset after the innings is complete.
			previousBatsman = -1; // denotes the batting position of the previous batsman. Reset after the innings is complete.
			previousDismissal = -1; // stores the index of the bowler who got the previous wicket. Set to -1 for run-outs.
			currentPartnership = 0; // denotes the index of the current partnership.

			strike = [0, 1]; // bring the openers to the crease
			strikeIndex = boundaryGap = 0;
			temp = Math.pow(-1, +(data.team[+tossIndex].streak < 0)) * ((total[+!tossIndex] + 1) / 5000) * data.team[+tossIndex].streak * team[+!tossIndex].meanRating;

			for (i = 0; i < 2; ++i) {
				desperation[i] = temp * (1 - team[+tossIndex].batRating[strike[i]] / 1000) / team[+tossIndex].batStrikeRate[strike[i]];
			}

			currentBowler = previousBowler = team[+!tossIndex].bowlRating.reduce((a, b, index, arr) => b > arr[a] ? index : a, 0); // select bowler to start the innings
			data.match.commentary.push(`${team[+!tossIndex].name[previousBowler]} to start proceedings from the pavilion end.....`);

			for (i = 0; (i < 20) && (wickets[+tossIndex] < 10) && (!loop || !(total[+!tossIndex] <= total[+tossIndex])); ++i) { // loop through for 20 overs
				// currentOver = [];
				previousOver = continuousMaximums = 0;

				if (hope && ((score[strike[+strikeIndex]] > 43 && score[strike[+strikeIndex]] < 50) || ((score[strike[+strikeIndex]] > 93 && score[strike[+strikeIndex]] < 100)))) {   // display special commentary if the current striker is close to a 50 / 100.
					data.match.commentary.push(`${team[+tossIndex].name[strike[+strikeIndex]]} ${helper.anticipate[score[strike[+strikeIndex]] > 50]}`);
				}

				for (j = 1; j < 7; ++j) { // loop through for 6 deliveries.
					// currentBall = []; // temporary array to hold commentary for the current over
					++deliveries[currentBowler]; // increase the number of balls bowled by the current bowler
					++balls[strike[+strikeIndex]]; // increase the number of balls faced by the current batsman
					++partnershipBalls[currentPartnership]; // increase the number of balls in the partnership
					++ballMatrix[strike[+strikeIndex]][currentBowler]; // increase the number of balls bowled by the current bowler to the current batsman
					deliveryScore = (team[+tossIndex].batRating[strike[+strikeIndex]] - team[+!tossIndex].bowlRating[currentBowler]) || 1; // base value for delivery outcome
					bowlIndex = team[+!tossIndex].bowlRating[currentBowler] / ((rand(team[+!tossIndex].bowlAverage[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / 1000 + 1) + team[+!tossIndex].bowlAverage[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / bowl[0]) * (rand(team[+!tossIndex].bowlStrikeRate[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / 1000 + 1) + team[+!tossIndex].bowlStrikeRate[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / bowl[1]) * (rand(team[+!tossIndex].economy[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / 1000 + 1) + team[+!tossIndex].economy[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / bowl[2]));
					batIndex = (rand(team[+tossIndex].batAverage[strike[+strikeIndex]] * team[+tossIndex].batRating[strike[+strikeIndex]] / 1000 + 1) + team[+tossIndex].batAverage[strike[+strikeIndex]] * (team[+tossIndex].batRating[strike[+strikeIndex]]) / bat[0]) * (rand(team[+tossIndex].batStrikeRate[strike[+strikeIndex]] * team[+tossIndex].batRating[strike[+strikeIndex]] / 1000 + 1) + team[+tossIndex].batStrikeRate[strike[+strikeIndex]] * (team[+tossIndex].batRating[strike[+strikeIndex]]) / bat[1]) / team[+!tossIndex].bowlRating[currentBowler] - ((Math.abs(frustration[+strikeIndex]) > 2) * Math.pow(-1, rand(2)) * frustration[+strikeIndex]);
					batIndex += Math.pow(-1, +(batIndex < bowlIndex)) * (rand(Math.log10(deliveryScore))) / 100 - bowlIndex;
					data.match.commentary.push(freeHit * "Free Hit: " || `${i} . ${j} ${team[+!tossIndex].name[currentBowler]} to ${team[+tossIndex].name[strike[+strikeIndex]]}, `);

					if (batIndex <= -process.env.OUT && !freeHit) { // if the batsman was dismissed off a regular ball
						temp = -1;
						++boundaryGap; // increase the number of balls since the last boundary was hit
						++wicketsTaken[currentBowler]; // increase the number of wickets taken by the current bowler
						++dotDeliveries[currentBowler]; // increase the number of dot balls bowled by the current bowler
						previousDismissal = currentBowler; // mark the current bowler as the one who effected the current dismissal
						++continuousWickets[currentBowler]; // increment the number of consecutive wickets taken by the current bowler
						wicketIndex = -Math.ceil(batIndex + process.env.OUT); // gauge mode of dismissal
						data.match.commentary[data.match.commentary.length - 1] += "OUT, ";

						if (wicketIndex < 5) { // non run outs
							temp = parseInt((batIndex + 1 + process.env.OUT) * 11, 10);
							data.match.commentary[data.match.commentary.length - 1] += rand(helper.dismiss[wicketIndex]);
						}
						else {
							deliveryScore = rand(3); // 0, 1, or 2 runs may be scored on a run out delivery

							if (deliveryScore) {
								previousOver += deliveryScore; // increment runs scored in the over
								--dotDeliveries[currentBowler]; // if runs were scored on the run out ball, adjust bowler's dot deliveries
								total[+tossIndex] += deliveryScore; // increment team total
								score[strike[+strikeIndex]] += deliveryScore; // increment batsman's individual score
								partnershipRuns[currentPartnership] += deliveryScore; // increment partnership runs
								data.match.commentary[data.match.commentary.length - 1] += ` ${deliveryScore} run(s), `;
							}

							strikeIndex ^= rand(2); // in a run out, either the striker or non-striker can be dismissed.
							previousDismissal = -1; // indicates the previous dismissal was a run out.
							--wicketsTaken[currentBowler]; // adjust wickets taken, see reason below.
							dismissed[strike[+strikeIndex]] = 1; // set the dismissed flag for the current batsman to true
							continuousWickets[currentBowler] = 0; // run outs do not contribute to a bowler's wicket tally
							previousBatsman = strike[+strikeIndex]; // set the previous batsman as the one who was just dismissed
							data.match.commentary[data.match.commentary.length - 1] += rand(helper.runout);

							if (loop && (total[+tossIndex] > total[+!tossIndex])) {
								overs[+tossIndex] = i * 6 + j; // adjust the number of balls batted, as the chase was successful
								// eslint-disable-next-line no-underscore-dangle
								data.match.commentary.push(`${data.team[+tossIndex]._id} have done it!`);
								break;
							}
							else if ((total[1] === total[0]) && loop) {
								data.match.commentary.push("Scores are level...");
							}
						}

						wicketSequence.push(`${total[+tossIndex]} / ${(wickets[+tossIndex] + 1)} ${team[+tossIndex].name[strike[+strikeIndex]]} ${(previousDismissal !== -1 ? `(${team[+!tossIndex].name[currentBowler]})` : "")} Overs: ${i} . ${j}`);
						temp = (balls[strike[+strikeIndex]] === 1) + !balls[strike[+strikeIndex]] * 2 + !score[strike[+strikeIndex]] * 3;
						data.match.commentary[data.match.commentary.length - 1] += helper.duck[temp]; // for special duck commentary

						if (wicketsTaken[currentBowler] === 5 && !fiveWicketHaul[currentBowler]) { // five wicket haul
							fiveWicketHaul[currentBowler] = 1; // set flag to indicate that a bowler's five wicket haul was acknowledged
							data.match.commentary.push(", that brings up his five wicket haul, yet another tick in a list of accomplishments.");
						}
						if ((score[strike[+strikeIndex]] > 44 && score[strike[+strikeIndex]] < 50) || (score[strike[+strikeIndex]] > 91 && score[strike[+strikeIndex]] < 100)) {
							data.match.commentary.push(rand(helper.miss[+(score[strike[+strikeIndex]] > 50)])); // acknowledgement commentary for a missed 50 / 100
						}
						if (continuousWickets[currentBowler] === 3) { // hat-trick
							continuousWickets[currentBowler] = 0; // to prevent duplicate, incorrect hat-trick commentary
							data.match.commentary.push(`${team[+!tossIndex].name[currentBowler]} gets his hat-trick! You don't get to see them a whole lot these days, the rest of his mates have mobbed him...`);
						}

						data.match.commentary.push(team[+tossIndex].name[strike[+strikeIndex]]);

						if (previousDismissal > -1) { // non run out
							data.match.commentary[data.match.commentary.length - 1] += ` ${helper.wicket[wicketIndex]} ${team[+!tossIndex].name[currentBowler]}`;

							if (temp > -1) { // if previous dismissal was off a catch, record the catcher's name.
								++catches[temp];
								data.match.commentary[data.match.commentary.length - 1] += ` ${data.team[+tossIndex].ratings[temp].Name}`;
							}
						}
						else {
							data.match.commentary[data.match.commentary.length - 1] += " run out";
						}
						if (balls[strike[+strikeIndex]]) {
							control[strike[+strikeIndex]] *= scale(balls[strike[+strikeIndex]] - 1, balls[strike[+strikeIndex]] + 1);
						}

						data.team[+tossIndex].avgPartnershipRuns[currentPartnership] = scale(partnershipRuns[currentPartnership] + data.team[+tossIndex].avgPartnershipRuns[currentPartnership] * data.team[+tossIndex].played, data.team[+tossIndex].played + 1);
						data.team[+tossIndex].avgPartnershipBalls[currentPartnership] = scale(partnershipBalls[currentPartnership] + data.team[+tossIndex].avgPartnershipBalls[currentPartnership] * data.team[+tossIndex].played, data.team[+tossIndex].played + 1);
						data.match.commentary.push(`${score[strike[+strikeIndex]]} (${balls[strike[+strikeIndex]]} balls ${fours[strike[+strikeIndex]]} X 4"s ${maximums[strike[+strikeIndex]]} X 6"s) SR: ${scale(score[strike[+strikeIndex]], balls[strike[+strikeIndex]], 100)} Control: ${scale(control[strike[+strikeIndex]], 0, 100)} %`);
						data.match.commentary.push(partnership()); // partnership commentary
						++currentPartnership; // move on to the next partnership
						frustration[+strikeIndex] = control[strike[+strikeIndex]] = 0; // reset control and frustration factors for the batsman
						strike[+strikeIndex] = Math.max(...strike) + 1; // bring the next batsman to the crease
						desperation[+strikeIndex] = +(data.team[+tossIndex].streak < 0) * (1 - team[+tossIndex].batRating[strike[+strikeIndex]] / 1000) * data.team[+tossIndex].streak * ((total[+!tossIndex] - total[+tossIndex] + 1) / 5000) * team[+!tossIndex].meanRating / team[+tossIndex].batStrikeRate[strike[+strikeIndex]];

						if (temp !== -1 && rand(2) && wickets[+tossIndex] < 9) {
							strikeIndex = !strikeIndex;
							data.match.commentary.push("The two batsmen crossed over while the catch was being taken.");
						}

						temp = 6 * i + j;

						if (++wickets[+tossIndex] === 10) { // all out
							overs[+tossIndex] = temp; // adjust overs, as the team has been dismissed within 20 overs
							++data.team[+tossIndex].allOuts;
							data.match.commentary.push("And that wraps up the innings.");
							break;
						}

						fallOfWicket = `${total[+tossIndex]} / ${wickets[+tossIndex]}, ${parseInt(temp / 6, 10)}.${temp % 6}`;
					}
					else {
						continuousWickets[currentBowler] = 0; // reset continuous wickets taken by the bowler
						deliveryScore = parseInt(batIndex, 10);
						deliveryScore *= deliveryScore > -1; // set deliverScore to 0 if negative, else leave as is

						if (deliveryScore > 9) {
							--j; // since this is a non legal delivery, the over counter will have to be reduced by one
							++extras;
							freeHit = rand(2); // determine if the extra is a no-ball or a wide
							deliveryScore = 0; // only extras can be scored off a non-legal ball
							++total[+tossIndex]; // extra run
							--deliveries[currentBowler]; // non-legal delivery
							--balls[strike[+strikeIndex]]; // doesn't count in the final tally of balls faced by the batsman
							++partnershipRuns[currentPartnership]; // extras are counted in partnership runs
							--partnershipBalls[currentPartnership]; // the same doesn't apply to the partnership balls
							--ballMatrix[strike[+strikeIndex]][currentBowler]; // adjust bowler - batsman ball matrix
							data.match.commentary[data.match.commentary.length - 1] += `${helper.extra[freeHit].prefix},${rand(helper.extra[freeHit].comm)}`;
						}
						else {
							freeHit = 0; // legal delivery
							deliveryScore = deliveryScore > 6 ? 6 : deliveryScore > 4 ? 4 : deliveryScore; // scale score down to a real level
							temp = helper.score[deliveryScore]; // commentary selection for the current delivery
							data.match.commentary[data.match.commentary.length - 1] += `${temp.prefix}, ${rand(temp.comm)}`; // score commentary for the current ball

							switch (deliveryScore) { // additional actions for special cases.
							case 0:
								++dot;
								++dotDeliveries[currentBowler]; // increment dot balls bowled by the current bowler
								++dotBalls[strike[+strikeIndex]]; // increment dot balls faced by the current batsman
								frustration[+strikeIndex] += 1 - team[+tossIndex].batRating[strike[+strikeIndex]] / 1000;
								control[strike[+strikeIndex]] *= scale(balls[strike[+strikeIndex]] - 1, balls[strike[+strikeIndex]]);
								break;
							case 4:
								++fours[strike[+strikeIndex]]; // increment the number of fours hit by the current batsman
								break;
							case 6:
								++continuousMaximums; // increment the number of continuous sixes hit in the current innings
								++maximums[strike[+strikeIndex]]; // increment the number of sixes hit by the current batsman
								break;
							default: break;
							}

							if (deliveryScore) { // non dot ball
								previousOver += deliveryScore; // update the runs scored in this over
								total[+tossIndex] += deliveryScore; // update the team's total
								score[strike[+strikeIndex]] += deliveryScore; // update the number of runs scored by the current batsman
								partnershipRuns[currentPartnership] += deliveryScore; // update the current partnership runs
								frustration[+strikeIndex] -= Math.pow(2, deliveryScore) / (1000 - team[+tossIndex].batRating[strike[+strikeIndex]]); // reduce batsman frustration, depending on the number of runs scored
								control[strike[+strikeIndex]] = scale(control[strike[+strikeIndex]] * (balls[strike[+strikeIndex]] - 1) + 1, balls[strike[+strikeIndex]]);
							}

							boundaryGap = (deliveryScore < 4) * (boundaryGap + 1); // increment or nullify the boundary gap
							continuousMaximums *= deliveryScore === 6; // nullify or set the continuous sixes counter
						}
						if ((total[1] === total[0]) && loop) {
							data.match.commentary.push("Scores are level now...");
						}
						else if (loop && (total[+tossIndex] > total[+!tossIndex])) {
							overs[+tossIndex] = i * 6 + j; // the target was chased down before the allocated 20 overs, hence the adjustments.
							// eslint-disable-next-line no-underscore-dangle
							data.match.commentary.push(`What an emphatic victory for ${data.team[+tossIndex]._id}!`);
							break;
						}
						if ((!milestone[strike[+strikeIndex]] && score[strike[+strikeIndex]] > 49) || (milestone[strike[+strikeIndex]] === 1 && score[strike[+strikeIndex]] > 99)) {
							++milestone[strike[+strikeIndex]]; // mark an accomplished milestone, to avoid repeating commentary
							data.match.commentary.push(rand(helper.milestone[score[strike[+strikeIndex]] > 99])); // commentary for 50 / 100
						}

						strikeIndex ^= deliveryScore % 2; // rotate strike if an odd no. of runs were scored.
					}
				}

				strikeIndex = !strikeIndex; // rotate strike unconditionally at the end of the over.

				if (continuousMaximums === 6) { // six sixes in the previous over
					data.match.commentary.push(`Six G.P.L maximums in the previous over! What an effort by ${team[+tossIndex].name[strike[+strikeIndex]]}!. The crowd is ecstatic, ${team[+!tossIndex].name[currentBowler]} is absolutely flabbergasted.`);
				}
				if (previousOver) { // non maiden over
					runsConceded[currentBowler] += previousOver;
					data.match.commentary.push(`Last Over: ${previousOver} run${previousOver > 1 ? "s" : ""}`); // plural / singular run adjustment
				}
				else if (j === 7) { // maiden over
					maidens[currentBowler] += 1; // increment number of maiden overs bowled by the current bowler
					data.match.commentary.push("Last over: maiden");
				}

				data.team[+tossIndex].scoredPerOver[i] = (data.team[+tossIndex].scoredPerOver[i] * data.team[+tossIndex].played + previousOver) / (data.team[+tossIndex].played + 1);
				data.team[+!tossIndex].concededPerOver[i] = (data.team[+!tossIndex].concededPerOver[i] * data.team[+!tossIndex].played + previousOver) / (data.team[+!tossIndex].played + 1);
				data.match.commentary.push(`Current score: ${total[+tossIndex]} / ${wickets[+tossIndex]}  Run rate: ${scale(total[+tossIndex], i + 1)}`);

				if (boundaryGap > 9) {
					data.match.commentary.push(`Balls since last boundary: ${boundaryGap}`);
				}
				if (loop) {
					if (total[+tossIndex] > total[+!tossIndex]) {
						break;
					}

					// eslint-disable-next-line no-underscore-dangle
					data.match.commentary.push(`RRR: ${scale(total[+!tossIndex] + 1 - total[+tossIndex], 19 - i)}  Equation: ${data.team[+tossIndex]._id} needs ${total[+!tossIndex] + 1 - total[+tossIndex]} runs from ${114 - 6 * i} balls with ${10 - wickets[+tossIndex]} wickets remaining`);
				}
				else if (i > 3 && i < 15) {
					temp = scale(total[+tossIndex], i + 1);

					for (j = 1; j < 5; ++j) {
						helper.projected.rates[j] = temp;
						helper.projected.totals[j] = total[+tossIndex] + (19 - i) * temp;
						temp = parseInt(temp + 2 * j, 10);
					}

					data.match.commentary.push("Projected scores", helper.projected.rates, helper.projected.totals);
				}
				if (strike[+strikeIndex] < 11) { // striker exists
					data.match.commentary.push(`${team[+tossIndex].name[strike[+strikeIndex]]} : ${score[strike[+strikeIndex]]} (${balls[strike[+strikeIndex]]}), Control: ${scale(control[strike[+strikeIndex]], 0, 100)} %`);
				}
				if (strike[+!strikeIndex] < 11) { // non-striker exists
					data.match.commentary.push(`${team[+tossIndex].name[strike[+!strikeIndex]]} : ${score[strike[+!strikeIndex]]} (${balls[strike[+!strikeIndex]]}), Control: ${scale(control[strike[+!strikeIndex]], 0, 100)} %`);
					data.match.commentary.push(partnership());
				}
				if (previousBatsman > -1) {
					data.match.commentary.push(`Previous Wicket: ${team[+tossIndex].name[previousBatsman]}: ${score[previousBatsman]} (${balls[previousBatsman]}) Control: ${scale(control[previousBatsman], 0, 100)} %`);

					if (previousDismissal > -1) {
						data.match.commentary.push(`Dismissed by: ${team[+!tossIndex].name[previousDismissal]}`);
					}
					else {
						data.match.commentary[data.match.commentary.length - 1] += "(run out)";
					}

					data.match.commentary.push(`Partnership: ${partnershipRuns[currentPartnership - 1]} (${partnershipBalls[currentPartnership - 1]}), run rate: ${scale(partnershipRuns[currentPartnership - 1], partnershipBalls[currentPartnership - 1], 6)} Fall of wicket: ${fallOfWicket} overs`);
				}

				lastFiveOvers.unshift(previousOver); // adds a new element at the beginning of the array
				data.match.commentary.push(`${team[+!tossIndex].name[currentBowler]}: ${parseInt(deliveries[currentBowler] / 6, 10)}.${deliveries[currentBowler] % 6} - ${maidens[currentBowler]}-${wicketsTaken[currentBowler]} - ${runsConceded[currentBowler]} - ${scale(runsConceded[currentBowler], deliveries[currentBowler], 6)}`);

				if (loop && (i < 19) && ((total[+!tossIndex] + 1 - total[+tossIndex]) / (19 - i) > 36) && hope) {
					hope = false;
					// eslint-disable-next-line no-underscore-dangle
					data.match.commentary.push(rand(helper.hopeless).replace("\t", data.team[+tossIndex]._id));
				}
				if (deliveries[currentBowler] === 24) {
					data.match.commentary.push(`And that brings an end to ${team[+!tossIndex].name[currentBowler]}"s spell.`);
				}
				if (i > 3) {
					temp = lastFiveOvers.reduce((a, b) => a + b, 0); // total runs scored in the last 5 overs.
					data.match.commentary.push(`Last 5 overs: ${lastFiveOvers}, ${temp} runs, run rate: ${scale(temp, 5)}`);
					lastFiveOvers.pop(); // discard the runs scored in the 6'th over before the current one.
				}

				currentBowler = temp = deliveries.findIndex(pickBowler); // find the first bowler without 4 overs bowled.

				for (j = temp + 1; j < 11; ++j) {
					if (deliveries[j] < 19 && team[+!tossIndex].bowlRating[j] > team[+!tossIndex].bowlRating[currentBowler] && j !== previousBowler) {
						currentBowler = j;
					}
				}

				previousBowler = currentBowler;
			}

			data.match.commentary.push(rand(helper.inter[loop])); // add mid-innings or post-match commentary

			for (i = 0; i < 11; ++i) { // update individual player stats across both teams
				++data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].matches;

				if (/^[ac]/.test(data.team[+tossIndex].squad[i])) { // batsmen and all rounders of the current batting team
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].fours += fours[i];
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].sixes += maximums[i];
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].ballsFaced += balls[i];
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].runsScored += score[i];
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].recent.push(score[i]);
					++data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]][helper.status[dismissed[i] || (strike.indexOf(i) > -1)]];
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].low = Math.min(data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].low, score[i]);
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].high = Math.max(data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].high, score[i]);
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].batAverage = scale(data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].runsScored, data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].outs);
					data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].batStrikeRate = scale(data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].runsScored, data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].ballsFaced, 100);
				}
				if (/^[bc]/.test(data.team[+!tossIndex].squad[i])) { // bowlers and all rounders of the current bowling team
					data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].catches += catches[i];
					data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].wickets += wicketsTaken[i];
					data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].ballsBowled += deliveries[i];
					data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].runsConceded += runsConceded[i];
					data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].bowlAverage = scale(data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].runsConceded, data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].wickets);
					data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].bowlStrikeRate = scale(data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].ballsBowled, data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].wickets);
					data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].economy = scale(data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].runsConceded, data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].ballsBowled, 6);
				}
			}

			j = 0;
			data.match.scorecard.push("Scorecard:", helper.batHeader); // table header for bating scorecard

			for (i = 0; i < 11; ++i) {
				if (!balls[i] && !dismissed[i]) { // the batsman wasn't dismissed, and did not face a single ball.
					data.match.scorecard.push([team[+tossIndex].name[i], " DNB "]);
				}
				else {
					if (balls[i]) {
						temp = (ballMatrix[i].reduce(batMoM, 0) / balls[i] - team[+tossIndex].batRating[i]) / 10;
						temp = (score[i] + 1) * (1 - Math.exp((temp - (Math.pow(fours[i], 1 / (1 - control[i])) + Math.pow(maximums[i], 1 / (1 - control[i])))) / (balls[i] + team[+tossIndex].batRating[i])));
						data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].points += temp;
						helper.checkMoM(MoM, temp, i, +tossIndex);
					}

					data.match.scorecard.push([team[+tossIndex].name[i], score[i], balls[i], scale(score[i], balls[i], 100), fours[i], maximums[i], dotBalls[i], scale(control[i], 0, 100)]);

					if (!dismissed[i]) {
						data.match.scorecard[data.match.scorecard.length - 1].push("(not out)");
					}
				}
				if (i < 10) { // a maximum of 10 partnerships can happen in one innings
					for (temp = 0; temp < 2; ++temp) {
						if (partnershipRuns[i] * Math.pow(-1, temp) > Math.pow(-1, temp) * data.team[+tossIndex][`${helper.extremes[temp]}PartnershipRuns`][i]) {
							data.team[+tossIndex][`${helper.extremes[temp]}PartnershipRuns`][i] = partnershipRuns[i];
							data.team[+tossIndex][`${helper.extremes[temp]}PartnershipBalls`][i] = partnershipBalls[i];
						}
					}

					partnershipRuns[i] = partnershipBalls[i] = 0;
				}

				j += fours[i] * 4 + maximums[i] * 6;
				data.team[+tossIndex].f += fours[i]; // team fours for this match
				data.team[+tossIndex].s += maximums[i]; // team sixes for this match
				data.team[+tossIndex].fours += fours[i]; // overall team fours
				data.team[+tossIndex].sixes += maximums[i]; // overall team sixes
			}

			data.match.scorecard.push(`Total: ${total[+tossIndex]} / ${wickets[+tossIndex]} (${parseInt(overs[+tossIndex] / 6, 10)}.${overs[+tossIndex] % 6} overs)  Run rate: ${scale(total[+tossIndex], overs[+tossIndex], 6)} Extras: ${extras}`);
			data.match.scorecard.push(`Runs scored in boundaries: ${j} of ${total[+tossIndex]} (${scale(j, total[+tossIndex], 100)} %) `);
			data.match.scorecard.push("Bowling Statistics:", helper.bowlHeader);

			for (i = 0; i < 11; ++i) {
				if (deliveries[i]) {
					++data.match.count[loop];
					temp = (ballMatrix.reduce(bowlMoM(i), 0) / deliveries[i] - team[+!tossIndex].bowlRating[i]) / 10;
					temp = ((wicketsTaken[i] + 1) * 25) * (1 - Math.exp((temp - Math.pow((dotDeliveries[i] + 1) * 100, wicketsTaken[i])) / (team[+!tossIndex].bowlRating[i] + deliveries[i] + runsConceded[i])));
					data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].points += temp;
					helper.checkMoM(MoM, temp, i, +!tossIndex); // check for MoM condition
					data.match.scorecard.push([team[+!tossIndex].name[i], `${parseInt(deliveries[i] / 6, 10)} . ${deliveries[i] % 6}`, maidens[i], wicketsTaken[i], runsConceded[i], scale(runsConceded[i], deliveries[i], 6)]);
				}

				fiveWicketHaul[i] = continuousWickets[i] = deliveries[i] = maidens[i] = runsConceded[i] = maximums[i] = wicketsTaken[i] = dotDeliveries[i] =
					balls[i] = fours[i] = dismissed[i] = milestone[i] = maximums[i] = score[i] = balls[i] = fours[i] = control[i] = catches[i] = dotBalls[i] = 0;
			}

			data.match.scorecard.push("Fall of wickets:", wicketSequence, `Dot ball percentage: ${scale(dot, overs[+tossIndex], 100)} %`, "   ");
			lastFiveOvers = [];
			wicketSequence = [];
			frustration = [0, 0];
			previousBatsman = -1;
			tossIndex = !tossIndex;
			ballMatrix = genArray(11, 11);
			extras = strikeIndex = freeHit = currentPartnership = dot = previousBowler = 0;
		}

		temp = +(total[0] === total[1]) + (wickets[0] === wickets[1]) * 2 + (overs[0] === overs[1]) * 4;
		// determining win / TIE conditions
		switch (temp) {
		case 0:
		case 2:
		case 4:
		case 6: // in these four cases, the runs scored will be different, indicating a regular victory
			winner = helper.decide(total, 1);

			if (total[+!tossIndex] < total[+tossIndex]) {
				// eslint-disable-next-line no-underscore-dangle
				data.match.commentary.push(`${data.team[winner]._id} wins by ${(10 - wickets[+tossIndex])} wicket(s) !`);
			}
			else {
				// eslint-disable-next-line no-underscore-dangle
				data.match.commentary.push(`${data.team[winner]._id}${(total[+!tossIndex] - total[+tossIndex])} run(s)!`);
			}

			break;
		case 1:
		case 3:
		case 5: // runs scored are equal, one of wickets or balls batted are different in count
			temp = temp === 3;
			winner = helper.decide(hinge(temp));
			// eslint-disable-next-line no-underscore-dangle
			data.match.commentary[data.match.commentary.length - 1] += `${data.team[winner]._id} wins! (${helper.winMode[temp]})`;
			break;
		case 7: // runs scored, wickets lost, balls batted are equal => a tie
			data.match.commentary.push("TIE !");
			temp = overs[0] * (team[1].meanRating - team[0].meanRating) / total[0] / 600;

			for (i = 0; i < 2; ++i) {
				++data.team[i].tied;
				++data.team[i].points;
				data.team[i].form += Math.pow(-1, i) * temp;
				data.team[i].progression.push((data.team[i].progression.slice(-1)[0] || 0) + 1);
			}
			break;
		default:
			break;
		}

		if (winner !== -1) {
			temp = (scale(overs[+winner], total[+winner], team[+!winner].meanRating) - scale(overs[+!winner], total[+!winner], team[+winner].meanRating)) / 2000;

			for (i = 0; i < 2; ++i) {
				++data.team[i][result[i === +winner].state]; // increment win / loss
				data.team[i].points += result[i === +winner].points; // increment points
				data.team[i].form += Math.pow(-1, +(i !== +winner)) * temp; // adjust team form
				data.team[i].ratio = scale(data.team[i].win, data.team[i].loss); // update win ratio
				data.team[i].progression.push((data.team[i].progression.slice(-1)[0] || 0) + result[i === +winner].points); // a cumulative sum array of points till date
				data.team[i].streak = Math.pow(-1, +(i === +winner)) * data.team[i].streak > 0 ? Math.pow(-1, +(i !== +winner)) : data.team[i].streak - Math.pow(-1, +(i === +winner));
			} // the above line updates the team's winning streak: incrementing / decrementing for wins / losses respectively
		}

		data.match.MoM = MoM;
		++data.team[MoM.team].stats[MoM.id].MoM; // increase MoM award count
		var findById = function (id, array) {
			var match = array.filter(function (e) {
				return e._id === id; // eslint-disable-line no-underscore-dangle
			});

			if (match.length) {
				return match[0];
			}
			console.log("name errors!");

			return null;
		};

		// eslint-disable-next-line no-underscore-dangle
		data.match.commentary.push(`Man of the Match: ${findById(MoM.id, data.team[MoM.team].ratings).Name} (${data.team[MoM.team]._id})`); // display man of the match
		data.match.commentary.push(rand(helper.mom[findById(MoM.id, data.team[MoM.team].ratings).Type]), rand(helper.state[1])); // additional man of the match commentary
		for (i = 0; i < 2; ++i) {
			++data.team[i].played;
			data.team[i].squad.pop(); // remove the coach from the squad array
			delete data.team[i].ratings; // player ratings are not needed anymore, discard them
			data.team[i].names = team[i].name;
			data.team[i].overs.push(overs[i]);
			data.team[i].scores.push(total[i]);
			data.team[i].wickets.push(wickets[i]);
			data.team[i].runRates.push(scale(total[i], overs[i], 6)); // array of run rates per match
			data.team[i].lowestTotal = Math.min(data.team[i].lowestTotal, total[i]);
			data.team[i].highestTotal = Math.max(data.team[i].highestTotal, total[i]);
			data.team[i].netRunRate = scale((data.team[i].runsFor / data.team[i].ballsFor) - (data.team[i].runsAgainst / data.team[i].ballsAgainst), 0, 6, 4);

			for (j = 0; j < 2; ++j) { // this loop updates runs, balls, wickets, average (runs, wickets, balls) for and against
				data.team[i][`runs${key[j].val}`] += total[key[j].index[i]];
				data.team[i][`balls${key[j].val}`] += overs[key[j].index[i]];
				data.team[i][`wickets${key[j].val}`] += wickets[key[j].index[i]];
				data.team[i][`avgRuns${key[j].val}`] = parseInt(scale(data.team[i][`runs${key[j].val}`], data.team[i].played), 10);
				data.team[i][`avgWickets${key[j].val}`] = parseInt(scale(data.team[i][`wickets${key[j].val}`], data.team[i].played), 10);
				data.team[i][`avgOvers${key[j].val}`] = Math.floor(data.team[i][`balls${key[j].val}`] / data.team[i].played / 6) + (Math.floor(data.team[i][`balls${key[j].val}`] / data.team[i].played) % 6) / 10;
			}
		}
	}

	console.timeEnd("sim"); // for benchmarking simulations
	callback({ team1: data.team[0], team2: data.team[1], match: data.match }); // pass updated data to post-match handler
};
