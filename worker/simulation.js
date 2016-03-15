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

console.time('sim');

var path = require('path').join;
var dir = [__dirname, '..', 'utils', 'commentary'];
var helper = require(path(__dirname, 'simHelper'));
var runout = require(path(...dir, 'out', 'runout'));
dir.push('misc');
var mom = require(path(...dir, 'mom'));
var half = require(path(...dir, 'half'));
var full = require(path(...dir, 'full'));
var miss = require(path(...dir, 'miss'));
var start = require(path(...dir, 'start'));
var hopeless = require(path(...dir, 'hopeless'));
var rand = helper.rand;
var genArray = helper.genArray;
var checkMoM = helper.checkMoM;
var MoM;
var strike;
var dismiss = helper.dismiss;
var scoreRef = helper.scoreRef;
var wicketRef = helper.wicketRef;
var count = [];
var Total = [0, 0];
var wickets = [0, 0];
var desperation = [];
var bat = helper.bat; // decrease to strengthen batting
var ref = helper.ref;
var Overs = [120, 120];
var bowl = helper.bowl; // increase to strengthen bowling
var lastFiveOvers = [];
var wicketSequence = [];
var frustration = [0, 0];
var score = genArray(11);
var balls = genArray(11);
var fours = genArray(11);
var control = genArray(11);
var catches = genArray(11);
var maidens = genArray(11);
var maximums = genArray(11);
var dotBalls = genArray(11);
var dismissed = genArray(11);
var milestone = genArray(11);
var deliveries = genArray(11);
var runsConceded = genArray(11);
var wicketsTaken = genArray(11);
var projected = helper.projected;
var dotDeliveries = genArray(11);
var fiveWicketHaul = genArray(11);
var ballsFaced = genArray(11, 11);
var partnershipRuns = genArray(10);
var partnershipBalls = genArray(10);
var continuousWickets = genArray(11);
var deliveriesBowled = genArray(11, 11);
//var form = ['poor', 'average', 'good', 'excellent'];
var i;
var j;
var k;
var toss;
var loop;
var team;
var temp;
var winner;
var dot = 0;
var tossIndex;
var extras = 0;
var hope = true;
var freeHit = 0;
var strikeIndex;
var currentOver;
var wicketIndex;
var boundaryGap;
var currentBall;
var fallOfWicket;
var batPerfIndex;
var bowlPerfIndex;
var deliveryScore;
var currentBowler;
var previousBowler;
var previousOver = 0;
var continuousMaximums;
var previousBatsman = -1;
var out = process.env.OUT;
var previousDismissal = -1;
var currentPartnership = 0;
var previousPartnership = -1;
var bowlMoM = (prev, curr, index) => (prev + curr * team[+tossIndex].batRating[index]);
var batMoM = (prev, curr, index) => (prev + curr * team[+!tossIndex].bowlRating[index]);

exports.simulate = function (data, callback)
{
    console.log(`${data.team[0]._id} vs ${data.team[1]._id}`);
    temp = [+(data.team[0].ratings.length < 12), +(data.team[1].ratings.length < 12)];
    data.team[0].names = data.team[1].names = ['', '', '', '', '', '', '', '', '', '', ''];

    if (temp[0] + temp[1])
    {
        for(i = 0; i < 2; ++i)
        {
            data.team[i].points += ref[temp[i]].points;
            ++data.team[i][ref[temp[i]].state];
        }
    }
    else
    {
        data.team[0].s = data.team[1].s = data.team[0].f = data.team[1].f = 0;
        data.match.overs = [];
        data.match.scorecard = [];
        data.match.commentary = [];

        toss = rand(2);
        ++data.team[toss].toss;
        temp = Make([data.team[0].ratings, data.team[1].ratings]);
        team = temp.teams;
        MoM = temp.MoM;

        temp = (team[0].meanRating * 100 / (team[0].meanRating + team[1].meanRating)); // make dynamic
        data.match.commentary.push(`Match ${data.match._id}: ${data.team[0]._id} versus ${data.team[1]._id}`);
        data.match.commentary.push(`Winning chances: ${data.team[0]._id} : ${temp.toFixed(2)} % | % ${(100 - temp).toFixed(2)} : ${data.team[1]._id}`);
        data.match.commentary.push(`Toss: ${data.team[toss]._id} wins the toss and chooses to `);

        if (rand(2))
        {
            data.match.commentary[data.match.commentary.length - 1] += 'bowl ';
        }
        else
        {
            toss = !toss;
            data.match.commentary[data.match.commentary.length - 1] += 'bat ';
        }

        data.match.commentary[data.match.commentary.length - 1] += 'first';
        data.match.commentary.push('Batting orders:');
        data.match.commentary.push([data.team[+!toss]._id,  data.team[+toss]._id]);

        for (i = 0; i < 11; ++i)
        {
            data.match.commentary.push([team[+!toss].name[i] + team[+!toss].type[i], team[+toss].name[i] + team[+toss].type[i]]);
        }

        tossIndex = !toss;

        for (loop = 0; loop < 2; ++loop)
        {
            strike = [0, 1];
            strikeIndex = boundaryGap = 0;
            temp = Math.pow(-1, +(data.team[+tossIndex].streak < 0)) * ((Total[+!toss] + 1) / 5000) * team[+!tossIndex].meanRating;
            temp *= data.team[+tossIndex].streak;

            for(i = 0; i < 2; ++i)
            {
                desperation[i] = temp * (1 - team[+tossIndex].batRating[strike[i]] / 1000);
                desperation[i] /= team[+tossIndex].batStrikeRate[strike[i]];
            }

            currentBowler = previousBowler = team[+!tossIndex].bowlRating.reduce((a, b, i, arr) => b > arr[a] ? i : a, 0);

            data.match.commentary.push(`${team[+!tossIndex].name[previousBowler]} to start proceedings from the pavilion end.....`);

            for (i = 0; i < 20 && (wickets[+tossIndex] < 10 && (Total[+toss] <= Total[+!toss])); ++i)
            {
                currentOver = [];
                data.match.commentary.push('');
                previousOver = continuousMaximums = 0;

                if (deliveries[currentBowler] === 18)
                {
                    data.match.commentary.push(`So the captain has chosen to bowl ${team[+!tossIndex].name[currentBowler]} out.`);
                }
                if(i)
                {
                    if ((score[strike[+strikeIndex]] >= 44 && score[strike[+strikeIndex]] < 50) && hope)
                    {
                        data.match.commentary.push(`${team[+tossIndex].name[strike[+strikeIndex]]} one hit away from a well deserving fifty. Will he make it ?`);
                    }
                    else if ((score[strike[+strikeIndex]] >= 94 && score[strike[+strikeIndex]] < 100))
                    {
                        data.match.commentary.push(`${team[+tossIndex].name[strike[+strikeIndex]]} knows there is a hundred for the taking if he can knuckle this one down....`);
                    }
                }

                for (j = 1; j <= 6; ++j)
                {
                    currentBall = [];
                    deliveryScore = team[+tossIndex].batRating[strike[+strikeIndex]] - team[+!tossIndex].bowlRating[currentBowler];
                    bowlPerfIndex = (team[+!tossIndex].bowlRating[currentBowler]) / ((rand(team[+!tossIndex].bowlAverage[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / 1000 + 1) + team[+!tossIndex].bowlAverage[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / bowl[0]) * (rand(team[+!tossIndex].bowlStrikeRate[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / 1000 + 1) + team[+!tossIndex].bowlStrikeRate[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / bowl[1]) * (rand(team[+!tossIndex].economy[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / 1000 + 1) + team[+!tossIndex].economy[currentBowler] * team[+!tossIndex].bowlRating[currentBowler] / bowl[2]));
                    batPerfIndex = (rand(team[+tossIndex].batAverage[strike[+strikeIndex]] * team[+tossIndex].batRating[strike[+strikeIndex]] / 1000 + 1) + team[+tossIndex].batAverage[strike[+strikeIndex]] * (team[+tossIndex].batRating[strike[+strikeIndex]]) / bat[0]) * (rand(team[+tossIndex].batStrikeRate[strike[+strikeIndex]] * team[+tossIndex].batRating[strike[+strikeIndex]] / 1000 + 1) + team[+tossIndex].batStrikeRate[strike[+strikeIndex]] * (team[+tossIndex].batRating[strike[+strikeIndex]]) / bat[1]) / team[+!tossIndex].bowlRating[currentBowler] - (Math.abs(frustration[+strikeIndex]) >= 3 ? Math.pow(-1, rand(2)) * frustration[+strikeIndex] : 0);
                    deliveryScore = deliveryScore || 1;

                    if (batPerfIndex > bowlPerfIndex)
                    {
                        batPerfIndex += (rand(Math.log10(deliveryScore))) / 100;
                    }
                    else
                    {
                        batPerfIndex -= (rand(Math.log10(Math.abs(deliveryScore)))) / 100;
                    }

                    ++deliveries[currentBowler];
                    ++balls[strike[+strikeIndex]];
                    batPerfIndex -= bowlPerfIndex;
                    ++partnershipBalls[currentPartnership];
                    ++ballsFaced[strike[+strikeIndex]][currentBowler];
                    ++deliveriesBowled[currentBowler][strike[+strikeIndex]];

                    if (freeHit)
                    {
                        data.match.commentary.push('Free Hit: ');
                    }
                    else
                    {
                        data.match.commentary.push(`${i} . ${j} ${team[+!tossIndex].name[currentBowler]} to ${team[+tossIndex].name[strike[+strikeIndex]]}, `);
                    }

                    if (batPerfIndex <= -out && !freeHit)
                    {
                        temp = -1;
                        ++boundaryGap;
                        ++wicketsTaken[currentBowler];
                        ++dotDeliveries[currentBowler];
                        previousDismissal = currentBowler;
                        ++continuousWickets[currentBowler];
                        dismissed[strike[+strikeIndex]] = 1;
                        previousBatsman = strike[+strikeIndex];
                        previousPartnership = currentPartnership;
                        data.match.commentary[data.match.commentary.length - 1] += 'OUT, ';

                        wicketIndex = -Math.ceil(batPerfIndex + out);

                        if (wicketIndex < 5)
                        {
                            temp = parseInt((batPerfIndex + 1 + out) * 11, 10);
                            data.match.commentary[data.match.commentary.length - 1] += rand(dismiss[wicketIndex]);
                        }
                        else
                        {
                            deliveryScore = rand(3);

                            if (deliveryScore)
                            {
                                previousOver += deliveryScore;
                                --dotDeliveries[currentBowler];
                                Total[+tossIndex] += deliveryScore;
                                score[strike[+strikeIndex]] += deliveryScore;
                                partnershipRuns[currentPartnership] += deliveryScore;
                                data.match.commentary[data.match.commentary.length - 1] += (` ${deliveryScore} run(s), `);
                            }
                            if (rand(2))
                            {
                                strikeIndex = !strikeIndex;
                            }

                            previousDismissal = -1;
                            --wicketsTaken[currentBowler];
                            continuousWickets[currentBowler] = 0;
                            data.match.commentary[data.match.commentary.length - 1] += rand(runout);

                            if ((Total[+toss] > Total[+!toss]) && loop)
                            {
                                Overs[+tossIndex] = i * 6 + j;
                                data.match.commentary.push(' What an emphatic victory ! ');
                                break;
                            }
                            else if ((Total[1] === Total[0]) && loop)
                            {
                                data.match.commentary.push('Scores are level...');
                            }
                        }

                        wicketSequence.push(`${Total[+tossIndex]} / ${(wickets[+tossIndex] + 1)} ${team[+tossIndex].name[strike[+strikeIndex]]} ${(previousDismissal !== -1 ? '(' +team[+!tossIndex].name[currentBowler] + ')' : '')} Overs: ${i} . ${j}`);

                        if (balls[strike[+strikeIndex]] === 1)
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' First ball ';
                        }
                        if (!score[strike[+strikeIndex]])
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' For a duck !';
                        }
                        if (wicketsTaken[currentBowler] === 5 && !fiveWicketHaul[currentBowler])
                        {
                            fiveWicketHaul[currentBowler] = 1;
                            data.match.commentary.push(', that brings up his five wicket haul, yet another tick in a list of accomplishments.');
                        }
                        if (score[strike[+strikeIndex]] >= 45 && score[strike[+strikeIndex]] < 50)
                        {
                            data.match.commentary.push(rand(miss.half).replace('/b', team[+tossIndex].name[strike[+strikeIndex]]));
                        }
                        else if (score[strike[+strikeIndex]] >= 90 && score[strike[+strikeIndex]] < 100)
                        {
                            data.match.commentary.push(rand(miss.full));
                        }
                        if (continuousWickets[currentBowler] === 3)
                        {
                            continuousWickets[currentBowler] = 0;
                            data.match.commentary.push(` And that is also a hattrick for ${team[+!tossIndex].name[currentBowler]} ! Fantastic bowling in the time of need.`);
                        }

                        data.match.commentary.push('  ' + team[+tossIndex].name[strike[+strikeIndex]]);

                        if (previousDismissal > -1)
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ` ${wicketRef[wicketIndex]} ${team[+!tossIndex].name[currentBowler]}`;

                            if (temp > -1)
                            {
                                ++catches[temp];
                                data.match.commentary[data.match.commentary.length - 1] += ` ${data.team[+tossIndex].ratings[temp].Name}`;
                            }
                        }
                        else
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' run out';
                        }
                        if (balls[strike[+strikeIndex]])
                        {
                            control[strike[+strikeIndex]] *= ((balls[strike[+strikeIndex]] - 1) / (balls[strike[+strikeIndex]])).toFixed(2);
                        }

                        data.team[+tossIndex].avgPartnershipRuns[currentPartnership] = parseFloat(((partnershipRuns[currentPartnership] + data.team[+tossIndex].avgPartnershipRuns[currentPartnership] * data.team[+tossIndex].played) / (data.team[+tossIndex].played + 1)).toFixed(2));
                        data.team[+tossIndex].avgPartnershipBalls[currentPartnership] = parseFloat(((partnershipBalls[currentPartnership] + data.team[+tossIndex].avgPartnershipBalls[currentPartnership] * data.team[+tossIndex].played) / (data.team[+tossIndex].played + 1)).toFixed(2));
                        data.match.commentary.push(`${score[strike[+strikeIndex]]} (${balls[strike[+strikeIndex]]} balls ${fours[strike[+strikeIndex]]} X 4's ${maximums[strike[+strikeIndex]]} X 6's) SR: ${((score[strike[+strikeIndex]] * 100) / balls[strike[+strikeIndex]]).toFixed(2)} Control: ${(control[strike[+strikeIndex]] * 100).toFixed(2)} %`);
                        data.match.commentary.push(`Partnership: ${partnershipRuns[currentPartnership]} (${partnershipBalls[currentPartnership]}), Run rate: ${(partnershipRuns[currentPartnership] * 6 / (partnershipBalls[currentPartnership] || 1)).toFixed(2)}`);

                        ++currentPartnership;
                        frustration[+strikeIndex] = 0;
                        control[strike[+strikeIndex]] = 0;
                        strike[+strikeIndex] = Math.max(strike[+strikeIndex], strike[+!strikeIndex]) + 1;
                        desperation[+strikeIndex] = +(data.team[+tossIndex].streak < 0) * (1 - team[+tossIndex].batRating[strike[+strikeIndex]] / 1000) * data.team[+tossIndex].streak * ((Total[+!toss] - Total[+toss] + 1) / 5000) * team[+!tossIndex].meanRating / team[+tossIndex].batStrikeRate[strike[+strikeIndex]];

                        if (temp !== -1 && rand(2) && wickets[+tossIndex] < 9)
                        {
                            strikeIndex = !strikeIndex;
                            data.match.commentary.push('The two batsmen crossed over while the catch was being taken.');
                        }
                        if (wickets[+tossIndex]++ === 9)
                        {
                            Overs[+tossIndex] = 6 * i + j;
                            ++data.team[+tossIndex].allOuts;
                            data.match.commentary.push('And that wraps up the innings.');

                            break;
                        }

                        batPerfIndex = i;

                        if (j === 6)
                        {
                            temp = 0;
                            ++batPerfIndex;
                        }
                        else
                        {
                            temp = j;
                        }

                        fallOfWicket = `${Total[+tossIndex]} / ${wickets[+tossIndex]}, ${batPerfIndex} . ${temp}`;
                    }
                    else
                    {
                        continuousWickets[currentBowler] = 0;
                        deliveryScore = parseInt(batPerfIndex, 10);
                        deliveryScore = +(deliveryScore > -1) && deliveryScore;

                        if (deliveryScore >= 10)
                        {
                            freeHit = rand(2);
                            data.match.commentary[data.match.commentary.length - 1] += `${helper.extraRef[freeHit].prefix}, ${rand(helper.extraRef[freeHit].comm)}`;

                            --j;
                            ++extras;
                            deliveryScore = 0;
                            ++Total[+tossIndex];
                            --deliveries[currentBowler];
                            --balls[strike[+strikeIndex]];
                            ++partnershipRuns[currentPartnership];
                            --partnershipBalls[currentPartnership];
                            --deliveriesBowled[currentBowler][strike[+strikeIndex]];
                        }
                        else
                        {
                            freeHit = 0;
                            deliveryScore = (deliveryScore > 6 ? 6 : deliveryScore > 4 ? 4 : deliveryScore);
                            temp = scoreRef[deliveryScore];
                            data.match.commentary[data.match.commentary.length - 1] += `${temp.prefix}, ${rand(temp.comm)}`;

                            switch (deliveryScore)
                            {
                                case 0:
                                    ++dot;
                                    ++dotDeliveries[currentBowler];
                                    ++dotBalls[strike[+strikeIndex]];
                                    frustration[+strikeIndex] += 1 - team[+tossIndex].batRating[strike[+strikeIndex]] / 1000;
                                    control[strike[+strikeIndex]] *= parseFloat(((balls[strike[+strikeIndex]] - 1) / (balls[strike[+strikeIndex]])).toFixed(2));
                                    break;

                                case 4:
                                    ++fours[strike[+strikeIndex]];
                                    break;

                                case 6:
                                    ++continuousMaximums;
                                    ++maximums[strike[+strikeIndex]];
                                    break;
                            }

                            if (deliveryScore)
                            {
                                previousOver += deliveryScore;
                                Total[+tossIndex] += deliveryScore;
                                score[strike[+strikeIndex]] += deliveryScore;
                                partnershipRuns[currentPartnership] += deliveryScore;
                                frustration[+strikeIndex] -= Math.pow(2, deliveryScore) / (1000 - team[+tossIndex].batRating[strike[+strikeIndex]]);
                                control[strike[+strikeIndex]] = parseFloat((control[strike[+strikeIndex]] * (balls[strike[+strikeIndex]] - 1) + 1) / (balls[strike[+strikeIndex]])).toFixed(2);
                            }

                            continuousMaximums = +(deliveryScore === 6) && continuousMaximums;
                            boundaryGap = +(deliveryScore < 4) && (boundaryGap + 1);
                        }
                        if ((Total[1] === Total[0]) && loop)
                        {
                            data.match.commentary.push('Scores are level now...');
                        }
                        else if ((Total[+toss] > Total[+!toss]) && loop)
                        {
                            Overs[+toss] = i * 6 + j;
                            data.match.commentary.push('And they have done it! What an emphatic victory !');
                            break;
                        }
                        if (!milestone[strike[+strikeIndex]] && score[strike[+strikeIndex]] >= 50)
                        {
                            ++milestone[strike[+strikeIndex]];
                            data.match.commentary.push(rand(half));
                        }
                        else if (milestone[strike[+strikeIndex]] === 1 && score[strike[+strikeIndex]] >= 100)
                        {
                            ++milestone[strike[+strikeIndex]];
                            data.match.commentary.push(rand(full));
                        }
                        if (deliveryScore % 2)
                        {
                            strikeIndex = !strikeIndex;
                        }
                    }
                }
                if (continuousMaximums === 6)
                {
                    data.match.commentary.push(`Six G.P.L maximums in the previous over! What an effort by ${team[+tossIndex].name[strike[+strikeIndex]]}!. The crowd is ecstatic, ${team[+!tossIndex].name[currentBowler]} is absolutely flabbergasted.`);
                }

                strikeIndex = !strikeIndex;
                data.match.commentary.push('Last over:');
                runsConceded[currentBowler] += previousOver;

                if (previousOver)
                {
                    data.match.commentary[data.match.commentary.length - 1] += `${previousOver} run${(previousOver > 1) ? 's' : ''}`;
                }
                else if (j === 7)
                {
                    maidens[currentBowler] += 1;
                    data.match.commentary[data.match.commentary.length - 1] += 'maiden';
                }

                data.team[+tossIndex].scoredPerOver[i] = (data.team[+tossIndex].scoredPerOver[i] * data.team[+tossIndex].played + previousOver) / (data.team[+tossIndex].played + 1);
                data.team[+!tossIndex].concededPerOver[i] = (data.team[+!tossIndex].concededPerOver[i] * data.team[+!tossIndex].played + previousOver) / (data.team[+!tossIndex].played + 1);
                data.match.commentary.push(`Current score: ${Total[+tossIndex]} / ${wickets[+tossIndex]}  Run rate: ${(Total[+tossIndex] / (i + 1)).toFixed(2)}`);

                if(boundaryGap >= 10)
                {
                    data.match.commentary.push(`Balls since last boundary: ${boundaryGap}`);
                }

                if(!loop)
                {
                    if(i > 3 && i < 15)
                    {
                        temp = parseFloat((Total[+tossIndex] / (i + 1)).toFixed(2));
                        data.match.commentary.push('Projected scores:');

                        for(k = 1; k < 4; ++k)
                        {
                            projected.rates[k] = temp;
                            projected.totals[k] = Total[+tossIndex] + (19 - i) * temp;
                            temp = parseInt(temp + 2);
                        }

                        data.match.commentary.push(projected.rates, projected.totals);
                    }
                }
                else
                {
                    data.match.commentary.push(`RRR: ${parseFloat(((Total[+!toss] + 1 - Total[+toss]) / (19 - i))).toFixed(2)}  Equation: ${data.team[+tossIndex]._id} needs ${Total[+!toss] + 1 - Total[+toss]} runs from ${114 - 6 * i} balls with ${10 - wickets[+toss]} wickets remaining`);

                    if (Total[+toss] > Total[+!toss])
                    {
                        break;
                    }
                }

                if (strike[+strikeIndex] < 11)
                {
                    data.match.commentary.push(`${team[+tossIndex].name[strike[+strikeIndex]]} : ${score[strike[+strikeIndex]]} (${balls[strike[+strikeIndex]]}), Control: ${(control[strike[+strikeIndex]] * 100).toFixed(2)} %`);
                }
                if (strike[+!strikeIndex] < 11)
                {
                    data.match.commentary.push(`${team[+tossIndex].name[strike[+!strikeIndex]]} : ${score[strike[+!strikeIndex]]} (${balls[strike[+!strikeIndex]]}), Control: ${(control[strike[+!strikeIndex]] * 100).toFixed(2)} %`);
                    data.match.commentary.push(`Partnership: ${partnershipRuns[currentPartnership]} (${partnershipBalls[currentPartnership]}), run rate: ${((partnershipRuns[currentPartnership] * 6) / (partnershipBalls[currentPartnership] || 1)).toFixed(2)}`);
                }
                if (previousBatsman > -1)
                {
                    data.match.commentary.push(`Previous Wicket: ${team[+tossIndex].name[previousBatsman]}: ${score[previousBatsman]} (${balls[previousBatsman]}) Control: ${(control[previousBatsman] * 100).toFixed(2)} %`);

                    if (previousDismissal > -1)
                    {
                        data.match.commentary.push(`Dismissed by: ${team[+!tossIndex].name[previousDismissal]}`);
                    }
                    else
                    {
                        data.match.commentary[data.match.commentary.length - 1] += '(run out)';
                    }

                    data.match.commentary.push(`Partnership: ${partnershipRuns[previousPartnership]} (${partnershipBalls[previousPartnership]}), run rate: ${(partnershipRuns[previousPartnership] * 6 / (partnershipBalls[previousPartnership] || 1)).toFixed(2)} Fall of wicket: ${fallOfWicket} overs`);
                }

                data.match.commentary.push(`${team[+!tossIndex].name[currentBowler]}: ${parseInt(deliveries[currentBowler] / 6, 10)}.${deliveries[currentBowler] % 6} - ${maidens[currentBowler]}-${wicketsTaken[currentBowler]} - ${runsConceded[currentBowler]} - ${(runsConceded[currentBowler] * 6 / deliveries[currentBowler]).toFixed(2)}`);

                if ((i < 19) && ((Total[+!toss] + 1 - Total[+toss]) / (19 - i) > 36) && hope && loop)
                {
                    hope = false;
                    data.match.commentary.push(rand(hopeless).replace('\t', data.team[+tossIndex]._id));
                }

                if (deliveries[currentBowler] === 24)
                {
                    data.match.commentary.push(`And that brings an end to ${team[+!tossIndex].name[currentBowler]}'s spell.`);
                }

                lastFiveOvers.unshift(previousOver); // unshift adds a new element at the beginning of the array

                if (i > 3)
                {
                    temp = lastFiveOvers.reduce((a, b) => a + b, 0);
                    data.match.commentary.push(`Last 5 overs: ${lastFiveOvers}, ${temp} runs, run rate: ${(temp / 5).toFixed(2)}`);
                    lastFiveOvers.pop();
                }

                currentBowler = temp = deliveries.findIndex((arg, i) => {return (arg <= 18) && (i !== previousBowler);});

                for (j = temp + 1; j < 11; ++j)
                {
                    if (deliveries[j] <= 18 && team[+!tossIndex].bowlRating[j] > team[+!tossIndex].bowlRating[currentBowler] && j !== previousBowler)
                    {
                        currentBowler = j;
                    }
                }

                previousBowler = currentBowler;
            }

            j = 0;
            hope = true;
            data.match.commentary.push(rand(helper.inter[loop]));

            for (i = 0; i < data.team[+tossIndex].squad.length; ++i)
            {
                if (data.team[+tossIndex].squad[i] > 'd')
                {
                    continue;
                }

                ++data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].matches;

                if ((data.team[+tossIndex].squad[i] < 'b') || (data.team[+tossIndex].squad[i] > 'c' && data.team[+tossIndex].squad[i] < 'd'))
                {
                    data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].recent.push(score[j]);
                    data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].ballsFaced += balls[j];
                    data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].runsScored += score[j];

                    if (dismissed[j])
                    {
                        ++data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].outs;
                    }
                    else if ((j === strike[+strikeIndex]) || (j === strike[+!strikeIndex]))
                    {
                        ++data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].notouts;
                    }

                    data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].batStrikeRate = parseFloat((data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].runsScored * 100 / (data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].ballsFaced || 1)).toFixed(2));
                    data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].batAverage = parseFloat((data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].runsScored / (data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].outs || 1)).toFixed(2));

                    if (data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].high < score[j])
                    {
                        data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].high = score[j];
                    }
                    if (data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].low > score[j])
                    {
                        data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].low = score[j];
                    }

                    data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].fours += fours[j];
                    data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].sixes += maximums[j++];
                }
            }

            j = 0;

            for (i = 0; i < data.team[+!tossIndex].squad.length; ++i)
            {
                if (data.team[+!tossIndex].squad[i] > 'b' && data.team[+!tossIndex].squad[i] < 'd')
                {
                    data.team[+!tossIndex].stats[data.team[+tossIndex].squad[i]].catches += catches[i];
                    data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].wickets += wicketsTaken[i];
                    data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].ballsBowled += deliveries[i];
                    data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].runsConceded += runsConceded[i];
                    data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].bowlAverage = parseFloat((data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].runsConceded / (data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].wickets || 1)).toFixed(2));
                    data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].bowlStrikeRate = parseFloat((data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].ballsBowled / (data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].wickets || 1)).toFixed(2));
                    data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].economy = parseFloat((data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].runsConceded * 6 / (data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].ballsBowled || 1)).toFixed(2));
                }
            }

            k = 0;
            data.match.scorecard.push('Scorecard:', ['Runs', 'Balls', 'Strike Rate', 'Fours', 'Sixes', 'Dot balls', 'Control (%)']);

            for (i = 0; i < 11; ++i)
            {
                if (!balls[i] && !dismissed[i])
                {
                    data.match.scorecard.push([team[+tossIndex].name[i], ' DNB ']);
                }
                else
                {
                    if(balls[i])
                    {
                        temp = ballsFaced[i].reduce(batMoM) / balls[i];
                        temp -= team[+tossIndex].batRating[i];
                        temp /= 10;
                        temp = (score[i] + 1) * (1 - Math.exp((temp - (Math.pow(fours[i], 1 / (1 - control[i])) + Math.pow(maximums[i], 1 / (1 - control[i])))) / (balls[i] + team[+tossIndex].batRating[i])));
                        data.team[+tossIndex].stats[data.team[+tossIndex].squad[i]].points += temp;
                        checkMoM(MoM, temp, i, +tossIndex);
                    }

                    data.match.scorecard.push([team[+tossIndex].name[i], score[i], balls[i], (score[i] * 100 / balls[i]).toFixed(2), fours[i], maximums[i], dotBalls[i], (control[i] * 100).toFixed(2)]);

                    if (!dismissed[i])
                    {
                        data.match.scorecard[data.match.scorecard.length - 1].push('  (not out)');
                    }
                }
                if (i < 10)
                {
                    if (partnershipRuns[i] > data.team[+tossIndex].bestPartnershipRuns[i])
                    {
                        data.team[+tossIndex].bestPartnershipRuns[i] = partnershipRuns[i];
                        data.team[+tossIndex].bestPartnershipBalls[i] = partnershipBalls[i];
                    }
                    if (partnershipRuns[i] < data.team[+tossIndex].worstPartnershipRuns[i])
                    {
                        data.team[+tossIndex].worstPartnershipRuns[i] = partnershipRuns[i];
                        data.team[+tossIndex].worstPartnershipBalls[i] = partnershipBalls[i];
                    }

                    partnershipRuns[i] = partnershipBalls[i] = 0;
                }

                k += fours[i] * 4 + maximums[i] * 6;
                data.team[+tossIndex].f += fours[i];
                data.team[+tossIndex].s += maximums[i];
                data.team[+tossIndex].fours += fours[i];
                data.team[+tossIndex].sixes += maximums[i];
                balls[i] = fours[i] = maximums[i] = dismissed[i] = milestone[i] = score[i] = balls[i] = fours[i] = maximums[i] = control[i] = catches[i] = dotBalls[i] = 0;
            }

            data.match.scorecard.push(`Total: ${Total[+tossIndex]} / ${wickets[+tossIndex]} (${parseInt(Overs[+tossIndex] / 6, 10)}.${Overs[+tossIndex] % 6} overs)  Run rate: ${(Total[+tossIndex] * 6 / (Overs[+tossIndex] || 1)).toFixed(2)} Extras: ${extras}`);
            data.match.scorecard.push(`Runs scored in boundaries: ${k} of ${Total[+tossIndex]} (${(k * 100 / Total[+tossIndex]).toFixed(2)} %) `);
            data.match.scorecard.push('Bowling Statistics:', ['Bowler', 'Overs', 'Maidens', 'Wickets', 'Runs conceded', 'Economy']);
            j = 0;

            for (i = 0; i < 11; ++i)
            {
                if(deliveries[i])
                {
                    ++j;
                    temp = deliveriesBowled[i].reduce(bowlMoM) / deliveries[i];
                    temp -= team[+!tossIndex].bowlRating[i];
                    temp /= 10;
                    temp = ((wicketsTaken[i] + 1) * 25) * (1 - Math.exp((temp - Math.pow((dotDeliveries[i] + 1) * 100, wicketsTaken[i])) / (team[+!tossIndex].bowlRating[i] + deliveries[i] + runsConceded[i])));
                    data.team[+!tossIndex].stats[data.team[+!tossIndex].squad[i]].points += temp;
                    checkMoM(MoM, temp, i, +!tossIndex);

                    data.match.scorecard.push([team[+!tossIndex].name[i], parseInt(deliveries[i] / 6, 10).toString() + '.' + (deliveries[i] % 6).toString(), maidens[i], wicketsTaken[i], runsConceded[i], (runsConceded[i] * 6 / (deliveries[i] || 1)).toFixed(2)]);
                    fiveWicketHaul[i] = continuousWickets[i] = deliveries[i] = maidens[i] = runsConceded[i] = wicketsTaken[i] = dotDeliveries[i] = 0;
                    deliveriesBowled[i] = genArray(11);
                }
            }

            count[loop] = j;
            lastFiveOvers = [];
            frustration = [0, 0];
            ballsFaced = genArray(11, 11);
            previousBatsman = previousPartnership = -1;

            data.match.scorecard.push('Fall of wickets:', wicketSequence);
            data.match.scorecard.push(`Dot ball percentage: ${(dot * 100 / Overs[+tossIndex]).toFixed(2)} %`, '   ');

            wicketSequence = [];
            tossIndex = !tossIndex;
            extras = strikeIndex = freeHit = currentPartnership = dot = previousBowler = 0;
        }

        data.match.count = count;

        if (Total[0] === Total[1])
        {
            if (wickets[0] === wickets[1])
            {
                if (Overs[0] === Overs[1])
                {
                    winner = -1;
                    data.match.commentary.push('TIE !');
                    temp =  Overs[0] * (team[1].meanRating - team[0].meanRating) / Total[0] / 600;

                    for(i = 0; i < 2; ++i)
                    {
                        ++data.team[i].tied;
                        ++data.team[i].points;
                        data.team[i].runsFor += Total[i];
                        data.team[i].ballsFor += Overs[i];
                        data.team[i].runsAgainst += Total[i];
                        data.team[i].ballsAgainst += Overs[i];
                        data.team[i].wicketsLost += wickets[i];
                        data.team[i].wicketsTaken += wickets[i];
                        data.team[i].form += Math.pow(-1, i) * temp;
                        data.team[i].lowestTotal = Math.min(data.team[i].lowestTotal, Total[i]);
                        data.team[i].highestTotal = Math.max(data.team[i].highestTotal, Total[i]);
                        data.team[i].progression.push((data.team[i].progression.slice(-1)[0] || 0) + 1);
                        data.team[i].netRunRate = (data.team[i].runsFor) / (data.team[i].ballsFor);
                        data.team[i].netRunRate -= (data.team[i].runsAgainst) / (data.team[i].ballsAgainst);
                        data.team[i].netRunRate = parseFloat((data.team[i].netRunRate * 6).toFixed(4));
                    }
                }
                else
                {
                    winner = ((Overs[+!toss] > Overs[+toss]) ? (+toss) : (+!toss));
                    data.match.commentary[data.match.commentary.length - 1] += `${data.team[+winner]._id} wins! (higher run rate)  `;
                }
            }
            else
            {
                winner = ((wickets[+!toss] > wickets[+toss]) ? (+toss) : (+!toss));
                data.match.commentary[data.match.commentary.length - 1] += `${data.team[+winner]._id} wins! (fewer wickets lost)  `;
            }
        }
        else
        {
            winner = ((Total[+toss] > Total[+!toss]) ? (+toss) : (+!toss));
            data.match.commentary.push(data.team[winner]._id + ' wins by ');

            if (Total[+!toss] < Total[+toss])
            {
                data.match.commentary[data.match.commentary.length - 1] += `${(10 - wickets[+toss])} wicket(s) !`;
            }
            else
            {
                data.match.commentary[data.match.commentary.length - 1] += `${(Total[+!toss] - Total[+toss])} run(s)!`;
            }
        }
        if (parseInt(winner, 10) !== -1)
        {
            temp = ((((Overs[+winner] * team[+!winner].meanRating) / (Total[+winner] || 1))));
            temp -= (((Overs[+!winner] * team[+winner].meanRating) / (Total[+!winner] || 1)));
            temp /= 2000;

            for(i = 0; i < 2; ++i)
            {
                data.team[i].runsFor += Total[i];
                data.team[i].ballsFor += Overs[i];
                data.team[i].scores.push(Total[i]);
                data.team[i].overs.push(Overs[i]);
                data.team[i].wickets.push(wickets[i]);
                data.team[i].runsAgainst += Total[+!i];
                data.team[i].ballsAgainst += Overs[+!i];
                data.team[i].wicketsLost += wickets[i];
                data.team[i].wicketsTaken += wickets[+!i];
                ++data.team[i][ref[+(i !== +winner)].state];
                data.team[i].points += ref[+(i !== +winner)].points;
                data.team[i].runRates.push((Total[i] * 6 / Overs[i]));
                data.team[i].form += Math.pow(-1, +(i !== +winner)) * temp;
                data.team[i].ratio = data.team[i].win / (data.team[i].loss || 1);
                data.team[i].lowestTotal = Math.min(data.team[i].lowestTotal, Total[i]);
                data.team[i].highestTotal = Math.max(data.team[i].highestTotal, Total[i]);
                data.team[i].netRunRate = (data.team[i].runsFor) / (data.team[i].ballsFor);
                data.team[i].netRunRate -= (data.team[i].runsAgainst) / (data.team[i].ballsAgainst);
                data.team[i].netRunRate = parseFloat((data.team[i].netRunRate * 6).toFixed(4));
                data.team[i].progression.push((data.team[i].progression.slice(-1)[0] || 0) + ref[+(i !== +winner)].points);
                data.team[i].streak = ((Math.pow(-1, +(i !== +winner)) * data.team[i].streak < 0) ? 1 : (data.team[i].streak + Math.pow(-1, +(i !== +winner))));
            }
        }

        data.match.MoM = MoM;
        ++data.team[MoM.team].stats[data.team[MoM.team].ratings[MoM.id]._id].MoM;
        data.match.commentary.push(`Man of the Match: ${data.team[MoM.team].ratings[MoM.id].Name} (${data.team[MoM.team]._id})`);
        data.match.commentary.push(rand((mom[data.team[MoM.team].ratings[MoM.id].Type] || mom.all)), rand(end));
    }

    for(i = 0; i < 2; ++i)
    {
        ++data.team[i].played;
        data.team[i].squad.pop();
        delete data.team[i].ratings;
        data.team[i].names = team[i].name;
        data.team[i].avgRunsFor = Math.round(data.team[i].runsFor / data.team[i].played);
        data.team[i].vgWicketsLost = Math.round(data.team[i].wicketsLost / data.team[i].played);
        data.team[i].avgRunsAgainst = Math.round(data.team[i].runsAgainst / data.team[i].played);
        data.team[i].avgWicketsTaken = Math.round(data.team[i].wicketsTaken / data.team[i].played);
        data.team[i].avgOversFor = Math.floor(data.team[i].ballsFor / data.team[i].played / 6) + (Math.floor(data.team[i].ballsFor / data.team[i].played) % 6) / 10;
        data.team[i].avgOversAgainst = Math.ceil(data.team[i].ballsAgainst / data.team[i].played / 6) + (Math.floor(data.team[i].ballsAgainst / data.team[i].played) % 6) / 10;
    }

    console.timeEnd('sim');

    callback(null, {
        team1: data.team[0],
        team2: data.team[1],
        match: data.match
    });
};
