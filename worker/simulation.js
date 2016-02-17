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

var temp = 0;
var path = require('path').join;
var helper = require(path(__dirname, 'simHelper'));
var cnb = require(path(__dirname, '..', 'utils', '..', 'utils', 'commentary', 'out', 'cnb'));
var lbw = require(path(__dirname, '..', 'utils', 'commentary', 'out', 'lbw'));
var caught = require(path(__dirname, '..', 'utils', 'commentary', 'out', 'caught'));
var bowled = require(path(__dirname, '..', 'utils', 'commentary', 'out', 'bowled'));
var runout = require(path(__dirname, '..', 'utils', 'commentary', 'out', 'runout'));
var stumped = require(path(__dirname, '..', 'utils', 'commentary', 'out', 'stumped'));
var mom = require(path(__dirname, '..', 'utils', 'commentary', 'misc', 'mom'));
var mid = require(path(__dirname, '..', 'utils', 'commentary', 'misc', 'mid'));
var end = require(path(__dirname, '..', 'utils', 'commentary', 'misc', 'end'));
var half = require(path(__dirname, '..', 'utils', 'commentary', 'misc', 'half'));
var full = require(path(__dirname, '..', 'utils', 'commentary', 'misc', 'full'));
var miss = require(path(__dirname, '..', 'utils', 'commentary', 'misc', 'miss'));
var start = require(path(__dirname, '..', 'utils', 'commentary', 'misc', 'start'));
var hopeless = require(path(__dirname, '..', 'utils', 'commentary', 'misc', 'hopeless'));
var one = require(path(__dirname, '..', 'utils', 'commentary', 'score', 'one'));
var two = require(path(__dirname, '..', 'utils', 'commentary', 'score', 'two'));
var six = require(path(__dirname, '..', 'utils', 'commentary', 'score', 'six'));
var zero = require(path(__dirname, '..', 'utils', 'commentary', 'score', 'dot'));
zero = zero.concat(require(path(__dirname, '..', 'utils', 'commentary', 'score', 'dot2')));
var four = require(path(__dirname, '..', 'utils', 'commentary', 'score', 'four'));
var three = require(path(__dirname, '..', 'utils', 'commentary', 'score', 'three'));
one = one.concat(require(path(__dirname, '..', 'utils', 'commentary', 'score', 'one2')));
var wide = require(path(__dirname, '..', 'utils', 'commentary', 'extra', 'wide'));
var freehit = require(path(__dirname, '..', 'utils', 'commentary', 'extra', 'freehit'));
var rand = helper.rand;
var MoM =
{
    id : '',
    team : '',
    points : 0
};
var dismiss =
[
    caught,
    bowled,
    lbw,
    cnb,
    stumped
];
var bat =    // decrease to strengthen batting
[
    process.env.BAT_AVG,
    process.env.BAT_STR
];
var strike;
var team = [];
var count = [];
var Total = [0, 0];
var wickets = [0, 0];
var desperation = [];
var Overs = [120, 120];
var ref =
[
    {
        points: 2,
        prop: 'win'
    },
    {
        points: 0,
        prop: 'loss'
    }
];
var bowl =      // increase to strengthen bowling
[
    process.env.BOWL_AVG,
    process.env.BOWL_STR,
    process.env.BOWL_ECO
];
var frustration = [0, 0];
var wicket_sequence = [];
var last_five_overs = [];
var deliveries_bowled =
[
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
var balls_faced =
[
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
var score = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var fours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var control = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var catches = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var maidens = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var maximums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dot_balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dismissed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var milestone = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var deliveries = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//var form = ['poor', 'average', 'good', 'excellent'];
var partnership_runs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var runs_conceded = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var wicket_reference = ['c', 'b', 'lbw', 'cnb', 'st'];
var wickets_taken = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var partnership_balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dot_deliveries = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var five_wicket_haul = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var continuous_wickets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var i;
var j;
var k;
var loop;
var winner;
var dot = 0;
var extras = 0;
var toss_index;
var hope = true;
var free_hit = 0;
var strike_index;
var current_over;
var wicket_index;
var boundary_gap;
var current_ball;
var fall_of_wicket;
var delivery_score;
var current_bowler;
var toss = rand(2);
var bat_perf_index;
var previous_bowler;
var bowl_perf_index;
var previous_over = 0;
var continuous_maximums;
var out = process.env.OUT;
var previous_batsman = -1;
var previous_dismissal = -1;
var current_partnership_index = 0;
var previous_partnership_index = -1;

exports.simulate = function (data, callback)
{
    console.log(`${data.team[0]._id} vs ${data.team[1]._id}`);

    if (data.team[0].ratings.length < 12 && data.team[1].ratings.length < 12)
    {
        console.log('Both teams forfeit');
        ++data.team[0].loss;
        ++data.team[1].loss;
        data.team[0].names = data.team[1].names = ['', '', '', '', '', '', '', '', '', '', ''];
    }
    else if (data.team[0].ratings.length < 12)
    {
        console.log(data.team[0]._id + ' forfeits');
        ++data.team[1].win;
        ++data.team[0].loss;
        data.team[1].points += 2;
        data.team[0].names = data.team[1].names = ['', '', '', '', '', '', '', '', '', '', ''];
    }
    else if (data.team[1].ratings.length < 12)
    {
        console.log(data.team[1]._id + ' forfeits');
        ++data.team[0].win;
        ++data.team[1].loss;
        data.team[0].points += 2;
        data.team[0].names = data.team[1].names = ['', '', '', '', '', '', '', '', '', '', ''];
    }
    else
    {
        data.team[0].s = 0;
        data.team[1].s = 0;
        data.team[0].f = 0;
        data.team[1].f = 0;
        data.match.scorecard = [];
        data.match.commentary = [];

        var Make = function (team, arg)
        {
            this.name = [];
            this.type = [];
            this.bat_avg = [];
            this.economy = [];
            this.bowl_avg = [];
            this.bat_rating = [];
            this.bowl_rating = [];
            this.avg_bat_rating = 0;
            this.avg_bowl_rating = 0;
            this.bat_strike_rate = [];
            this.bowl_strike_rate = [];
            this.coach_rating = team[11].Rating || -50;

            for (i = 0; i < 11; ++i)
            {
                this.name.push(team[i].Name);
                this.name.push(team[i].Name);

                switch (team[i].Type)
                {
                    case 'bat':
                        if(team[i].Rating > temp)
                        {
                            MoM.team = arg;
                            temp = team[i].Rating;
                            MoM.id = team[i]._id;
                        }

                        this.type.push(' (bat)');
                        this.economy.push(10);
                        this.bowl_avg.push(30);
                        this.bat_avg.push(team[i].Average);
                        this.bat_rating.push(team[i].Rating);
                        this.bowl_rating.push(900 - team[i].Rating);
                        this.bowl_strike_rate.push(40);
                        this.bat_strike_rate.push(team[i]['Strike Rate']);

                        break;

                    case 'bowl':
                        if(team[i].Rating > temp)
                        {
                            MoM.team = arg;
                            temp = team[i].Rating;
                            MoM.id = team[i]._id;
                        }

                        this.type.push(' (bowl)');
                        this.bowl_avg.push(team[i].Avg);
                        this.economy.push(team[i].Economy);
                        this.bat_avg.push(team[i].Average);
                        this.bowl_strike_rate.push(team[i].SR);
                        this.bowl_rating.push(team[i].Rating);
                        this.bat_strike_rate.push(team[i]['Strike Rate']);
                        this.bat_rating.push(900 - team[i].Rating);

                        break;

                    case 'all':
                        if(team[i].Bat > temp)
                        {
                            MoM.team = arg;
                            temp = team[i].Bat;
                            MoM.id = team[i]._id;
                        }
                        if(team[i].Bowl > temp)
                        {
                            MoM.team = arg;
                            temp = team[i].Bowl;
                            MoM.id = team[i]._id;
                        }

                        this.type.push(' (all)');
                        this.bowl_avg.push(team[i].Avg);
                        this.bat_rating.push(team[i].Bat);
                        this.economy.push(team[i].Economy);
                        this.bat_avg.push(team[i].Average);
                        this.bowl_rating.push(team[i].Bowl);
                        this.bowl_strike_rate.push(team[i].SR);
                        this.bat_strike_rate.push(team[i]['Strike Rate']);

                        break;
                }

                this.avg_bat_rating += this.bat_rating[i];
                this.avg_bowl_rating += this.bowl_rating[i];
            }

            this.mean_rating = (this.avg_bat_rating + this.avg_bowl_rating) / 22;

            for (i = 0; i < 11; ++i)
            {
                this.bat_rating[i] = (this.bat_rating[i] < 0) ? ((this.coach_rating < 0) ? (0) : (this.coach_rating)) : (this.bat_rating[i]);
                this.bowl_rating[i] = (this.bowl_rating[i] < 0) ? ((this.coach_rating < 0) ? (0) : (this.coach_rating)) : (this.bowl_rating[i]);
                this.bat_rating[i] += parseFloat(this.bat_rating[i]) / (10) - parseFloat(this.avg_bat_rating) / (110) + parseInt(this.coach_rating, 10);
                this.bowl_rating[i] += parseFloat(this.bowl_rating[i]) / (10) - parseFloat(this.avg_bowl_rating) / (110) + parseInt(this.coach_rating, 10);
            }
        };

        ++data.team[toss].toss;
        team[0].push(new Make(data.team[0].ratings, 0));
        team[1].push(new Make(data.team[1].ratings, 1));

        data.match.commentary.push(`Match ${data.match._id}: ${data.team[0]._id} versus ${data.team[1]._id}`);
        temp = (team[0].mean_rating * 100 / (team[0].mean_rating + team[1].mean_rating)); // TODO: make dynamic
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

        toss_index = !toss;

        for (loop = 0; loop < 2; ++loop)
        {
            strike = [0, 1];
            strike_index = boundary_gap = 0;

            temp = Math.pow(-1, +(data.team[+toss_index].streak < 0)) * ((Total[+!toss] + 1) / 5000) * mean_rating[+!toss_index];
            temp *= data.team[+toss_index].streak;

            for(i = 0; i < 2; ++i)
            {
                desperation[i] = temp * (1 - team[+toss_index].bat_rating[strike[i]] / 1000);
                desperation[i] /= team[+toss_index].bat_strike_rate[strike[i]];
            }

            current_bowler = previous_bowler = team[+!toss_index].bowl_rating.reduce((a, b, i, arr) => b > arr[a] ? i : a, 0);

            data.match.commentary.push(`${team[+!toss_index].name[previous_bowler]} to start proceedings from the pavilion end.....`);

            for (i = 0; i < 20 && (wickets[+toss_index] < 10 && (Total[+toss] <= Total[+!toss])); ++i)
            {
                current_over = [];
                data.match.commentary.push('');
                previous_over = continuous_maximums = 0;

                if (deliveries[current_bowler] === 18)
                {
                    data.match.commentary.push(`So the captain has chosen to bowl ${team[+!toss_index].name[current_bowler]} out.`);
                }
                if(i)
                {
                    if ((score[strike[+strike_index]] >= 44 && score[strike[+strike_index]] < 50) && hope)
                    {
                        data.match.commentary.push(`${team[+toss_index].name[strike[+strike_index]]} one hit away from a well deserving fifty. Will he make it ?`);
                    }
                    else if ((score[strike[+strike_index]] >= 94 && score[strike[+strike_index]] < 100))
                    {
                        data.match.commentary.push(`${team[+toss_index].name[strike[+strike_index]]} knows there is a hundred for the taking if he can knuckle this one down....`);
                    }
                }

                for (j = 1; j <= 6; ++j)
                {
                    current_ball = [];
                    delivery_score = team[+toss_index].bat_rating[strike[+strike_index]] - team[+!toss_index].bowl_rating[current_bowler];
                    bowl_perf_index = (team[+!toss_index].bowl_rating[current_bowler]) / ((rand(team[+!toss_index].bowl_avg[current_bowler] * team[+!toss_index].bowl_rating[current_bowler] / 1000 + 1) + team[+!toss_index].bowl_avg[current_bowler] * team[+!toss_index].bowl_rating[current_bowler] / bowl[0]) * (rand(team[+!toss_index].bowl_strike_rate[current_bowler] * team[+!toss_index].bowl_rating[current_bowler] / 1000 + 1) + team[+!toss_index].bowl_strike_rate[current_bowler] * team[+!toss_index].bowl_rating[current_bowler] / bowl[1]) * (rand(team[+!toss_index].economy[current_bowler] * team[+!toss_index].bowl_rating[current_bowler] / 1000 + 1) + team[+!toss_index].economy[current_bowler] * team[+!toss_index].bowl_rating[current_bowler] / bowl[2]));
                    bat_perf_index = (rand(team[+toss_index].bat_avg[strike[+strike_index]] * team[+toss_index].bat_rating[strike[+strike_index]] / 1000 + 1) + team[+toss_index].bat_avg[strike[+strike_index]] * (team[+toss_index].bat_rating[strike[+strike_index]]) / bat[0]) * (rand(team[+toss_index].bat_strike_rate[strike[+strike_index]] * team[+toss_index].bat_rating[strike[+strike_index]] / 1000 + 1) + team[+toss_index].bat_strike_rate[strike[+strike_index]] * (team[+toss_index].bat_rating[strike[+strike_index]]) / bat[1]) / team[+!toss_index].bowl_rating[current_bowler] - (Math.abs(frustration[+strike_index]) >= 3 ? Math.pow(-1, rand(2)) * frustration[+strike_index] : 0);
                    // TODO: Realism fix.
                    delivery_score = delivery_score || 1;

                    if (bat_perf_index > bowl_perf_index)
                    {
                        bat_perf_index += (rand(Math.log10(delivery_score))) / 100;
                    }
                    else
                    {
                        bat_perf_index -= (rand(Math.log10(Math.abs(delivery_score)))) / 100;
                    }

                    ++deliveries[current_bowler];
                    ++balls[strike[+strike_index]];
                    bat_perf_index -= bowl_perf_index;
                    ++balls_faced[+strike_index][current_bowler];
                    ++partnership_balls[current_partnership_index];
                    ++deliveries_bowled[current_bowler][strike[+strike_index]];

                    if (free_hit)
                    {
                        data.match.commentary.push(' Free Hit: ');
                    }
                    else
                    {
                        data.match.commentary.push(`${i} . ${j} ${team[+!toss_index].name[current_bowler]} to ${team[+toss_index].name[strike[+strike_index]]}, `);
                    }

                    if (bat_perf_index <= -out && !free_hit)
                    {
                        temp = -1;
                        ++boundary_gap;
                        ++wickets_taken[current_bowler];
                        ++dot_deliveries[current_bowler];
                        previous_dismissal = current_bowler;
                        dismissed[strike[+strike_index]] = 1;
                        ++continuous_wickets[current_bowler];
                        previous_batsman = strike[+strike_index];
                        previous_partnership_index = current_partnership_index;
                        data.match.commentary[data.match.commentary.length - 1] += 'OUT, ';

                        wicket_index = -Math.ceil(bat_perf_index + out);

                        if (wicket_index < 5)
                        {
                            temp = parseInt((bat_perf_index + 1 + out) * 11, 10);
                            data.match.commentary[data.match.commentary.length - 1] += rand(dismiss[wicket_index]);
                        }
                        else
                        {
                            delivery_score = rand(3);

                            if (delivery_score)
                            {
                                previous_over += delivery_score;
                                --dot_deliveries[current_bowler];
                                Total[+toss_index] += delivery_score;
                                score[strike[+strike_index]] += delivery_score;
                                partnership_runs[current_partnership_index] += delivery_score;
                                data.match.commentary[data.match.commentary.length - 1] += (` ${delivery_score} run(s), `);
                            }
                            if (rand(2))
                            {
                                strike_index = !strike_index;
                            }

                            previous_dismissal = -1;
                            --wickets_taken[current_bowler];
                            continuous_wickets[current_bowler] = 0;
                            data.match.commentary[data.match.commentary.length - 1] += rand(runout);

                            if ((Total[+toss] > Total[+!toss]) && loop)
                            {
                                Overs[+toss_index] = i * 6 + j;
                                data.match.commentary.push(' What an emphatic victory ! ');
                                break;
                            }
                            else if ((Total[1] === Total[0]) && loop)
                            {
                                data.match.commentary.push('Scores are level...');
                            }
                        }

                        wicket_sequence.push(`${Total[+toss_index]} / ${(wickets[+toss_index] + 1)} ${team[+toss_index].name[strike[+strike_index]]} ${(previous_dismissal !== -1 ? '(' +team[+!toss_index].name[current_bowler] + ')' : '')} Overs: ${i} . ${j}`);

                        if (balls[strike[+strike_index]] === 1)
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' First ball ';
                        }
                        if (!score[strike[+strike_index]])
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' For a duck !';
                        }
                        if (wickets_taken[current_bowler] === 5 && !five_wicket_haul[current_bowler])
                        {
                            five_wicket_haul[current_bowler] = 1;
                            data.match.commentary.push(', that brings up his five wicket haul, yet another tick in a list of accomplishments.');
                        }
                        if (score[strike[+strike_index]] >= 45 && score[strike[+strike_index]] < 50)
                        {
                            data.match.commentary.push(rand(miss.half).replace('/b', team[+toss_index].name[strike[+strike_index]]));
                        }
                        else if (score[strike[+strike_index]] >= 90 && score[strike[+strike_index]] < 100)
                        {
                            data.match.commentary.push(rand(miss.full));
                        }
                        if (continuous_wickets[current_bowler] === 3)
                        {
                            continuous_wickets[current_bowler] = 0;
                            data.match.commentary.push(` And that is also a hattrick for ${team[+!toss_index].name[current_bowler]} ! Fantastic bowling in the time of need.`);
                        }

                        data.match.commentary.push('  ' + team[+toss_index].name[strike[+strike_index]]);

                        if (previous_dismissal > -1)
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ` ${wicket_reference[wicket_index]} ${team[+!toss_index].name[current_bowler]}`;

                            if (temp > -1)
                            {
                                ++catches[temp];
                                data.match.commentary[data.match.commentary.length - 1] += ` ${data.team[+toss_index].ratings[temp].Name}`;
                            }
                        }
                        else
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' runout';
                        }
                        if (balls[strike[+strike_index]])
                        {
                            control[strike[+strike_index]] *= ((balls[strike[+strike_index]] - 1) / (balls[strike[+strike_index]])).toFixed(2);
                        }

                        temp = 0;

                        for (k = 0; k < 6; ++k)
                        {
                            temp += balls_faced[+strike_index][j] * team[+!toss_index].bowl_rating[j];
                        }

                        temp /= balls[strike[+strike_index]];
                        temp -= team[+toss_index].bat_rating[strike[+strike_index]];
                        temp /= 10;
                        temp = (score[strike[+strike_index]] + 1) * (1 - Math.exp((temp - (Math.pow(fours[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])) + Math.pow(maximums[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])))) / (balls[strike[+strike_index]] + team[+toss_index].bat_rating[strike[+strike_index]])));
                        data.team[+toss_index].stats[data.team[+toss_index].squad[strike[+strike_index]]].points += temp;

                        if (MoM.points < temp)
                        {
                            MoM.team = +toss_index;
                            MoM.points = Math.round(temp);
                            MoM.id = strike[+strike_index];
                        }

                        data.team[+toss_index].avg_partnership_runs[current_partnership_index] = parseFloat(((partnership_runs[current_partnership_index] + data.team[+toss_index].avg_partnership_runs[current_partnership_index] * data.team[+toss_index].played) / (data.team[+toss_index].played + 1)).toFixed(2));
                        data.team[+toss_index].avg_partnership_balls[current_partnership_index] = parseFloat(((partnership_balls[current_partnership_index] + data.team[+toss_index].avg_partnership_balls[current_partnership_index] * data.team[+toss_index].played) / (data.team[+toss_index].played + 1)).toFixed(2));
                        data.match.commentary.push(`${score[strike[+strike_index]]} (${balls[strike[+strike_index]]} balls ${fours[strike[+strike_index]]} X 4\'s ${maximums[strike[+strike_index]]} X 6\'s) SR: ${((score[strike[+strike_index]] * 100) / balls[strike[+strike_index]]).toFixed(2)} Control: ${(control[strike[+strike_index]] * 100).toFixed(2)} %`);
                        data.match.commentary.push(`Partnership: ${partnership_runs[current_partnership_index]} (${partnership_balls[current_partnership_index]}), Runrate: ${(partnership_runs[current_partnership_index] * 6 / (partnership_balls[current_partnership_index] || 1)).toFixed(2)}`);
                        ++current_partnership_index;
                        frustration[+strike_index] = 0;
                        control[strike[+strike_index]] = 0;
                        balls_faced[+strike_index] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        strike[+strike_index] = Math.max(strike[+strike_index], strike[+!strike_index]) + 1;
                        desperation[+strike_index] = +(data.team[+toss_index].streak < 0) * (1 - team[+toss_index].bat_rating[strike[+strike_index]] / 1000) * data.team[+toss_index].streak * ((Total[+!toss] - Total[+toss] + 1) / 5000) * mean_rating[+!toss_index] / team[+toss_index].bat_strike_rate[strike[+strike_index]];

                        if (temp !== -1 && rand(2) && wickets[+toss_index] < 9)
                        {
                            strike_index = !strike_index;
                            data.match.commentary.push(' The two batsmen crossed over while the catch was being taken.');
                        }
                        if (wickets[+toss_index]++ === 9)
                        {
                            Overs[+toss_index] = 6 * i + j;
                            ++data.team[+toss_index].all_outs;
                            data.match.commentary.push('And that wraps up the innings.');

                            break;
                        }

                        bat_perf_index = i;

                        if (j === 6)
                        {
                            temp = 0;
                            ++bat_perf_index;
                        }
                        else
                        {
                            temp = j;
                        }

                        fall_of_wicket = Total[+toss_index] + ' / ' + wickets[+toss_index] + ', ' + bat_perf_index + '.' + temp;
                    }
                    else
                    {
                        if(delivery_score < 0)
                        {
                            delivery_score = 0;
                        }

                        continuous_wickets[current_bowler] = 0;
                        delivery_score = parseInt(bat_perf_index, 10);
                        delivery_score = ((delivery_score < 0) ? 0 : delivery_score);

                        if (delivery_score >= 10)
                        {
                            if (rand(2))
                            {
                                data.match.commentary[data.match.commentary.length - 1] += `wide, ${rand(wide)}`;
                            }
                            else
                            {
                                free_hit = 1;
                                data.match.commentary[data.match.commentary.length - 1] += `no ball, ${rand(freehit)}`;
                            }

                            --j;
                            ++extras;
                            delivery_score = 0;
                            ++Total[+toss_index];
                            --deliveries[current_bowler];
                            --balls[strike[+strike_index]];
                            ++partnership_runs[current_partnership_index];
                            --partnership_balls[current_partnership_index];
                            --deliveries_bowled[current_bowler][strike[+strike_index]];
                        }
                        else
                        {
                            free_hit = 0;

                            if(delivery_score > 4 && delivery_score <= 6)
                            {
                                delivery_score = 4;
                            }
                            else if(delivery_score > 6 && delivery_score < 10)
                            {
                                delivery_score = 6;
                            }

                            switch (delivery_score)
                            {
                                case 0:
                                    ++dot;
                                    ++dot_deliveries[current_bowler];
                                    ++dot_balls[strike[+strike_index]];
                                    data.match.commentary[data.match.commentary.length - 1] += (`No run, ${rand(zero)}`);
                                    frustration[+strike_index] += 1 - team[+toss_index].bat_rating[strike[+strike_index]] / 1000;
                                    control[strike[+strike_index]] *= parseFloat(((balls[strike[+strike_index]] - 1) / (balls[strike[+strike_index]])).toFixed(2));
                                    break;

                                case 1: data.match.commentary[data.match.commentary.length - 1] += (`1 run, ${rand(one)}`);
                                    break;

                                case 2: data.match.commentary[data.match.commentary.length - 1] += (`2 runs, ${rand(two)}`);
                                    break;

                                case 3: data.match.commentary[data.match.commentary.length - 1] += (`3 runs, ${rand(three)}`);
                                    break;

                                case 4:
                                    ++fours[strike[+strike_index]];
                                    data.match.commentary[data.match.commentary.length - 1] += (`FOUR, ${rand(four)}`);
                                    break;

                                case 6:
                                    ++continuous_maximums;
                                    ++maximums[strike[+strike_index]];
                                    data.match.commentary[data.match.commentary.length - 1] += (`SIX, ${rand(six)}`);
                                    break;
                            }

                            if (delivery_score)
                            {
                                previous_over += delivery_score;
                                Total[+toss_index] += delivery_score;
                                score[strike[+strike_index]] += delivery_score;
                                partnership_runs[current_partnership_index] += delivery_score;
                                frustration[+strike_index] -= Math.pow(2, delivery_score) / (1000 - team[+toss_index].bat_rating[strike[+strike_index]]);
                                control[strike[+strike_index]] = parseFloat((control[strike[+strike_index]] * (balls[strike[+strike_index]] - 1) + 1) / (balls[strike[+strike_index]])).toFixed(2);
                            }

                            continuous_maximums = ((delivery_score !== 6) ? 0 : continuous_maximums);
                            boundary_gap = (delivery_score >= 4) ? 0 : (boundary_gap + 1);
                        }
                        if ((Total[1] === Total[0]) && loop)
                        {
                            data.match.commentary.push('Scores are level now...');
                        }
                        else if ((Total[+toss] > Total[+!toss]) && loop)
                        {
                            Overs[+toss] = 6 * i + j;
                            data.match.commentary.push('And they have done it! What an emphatic victory !');
                            break;
                        }
                        if (!milestone[strike[+strike_index]] && score[strike[+strike_index]] >= 50)
                        {
                            ++milestone[strike[+strike_index]];
                            data.match.commentary.push(rand(half));
                        }
                        else if (milestone[strike[+strike_index]] === 1 && score[strike[+strike_index]] >= 100)
                        {
                            ++milestone[strike[+strike_index]];
                            data.match.commentary.push(rand(full));
                        }
                        if (delivery_score % 2)
                        {
                            strike_index = !strike_index;
                        }
                    }
                }
                if (continuous_maximums === 6)
                {
                    data.match.commentary.push(`Six G.P.L maximums in the previous over! What an effort by ${team[+toss_index].name[strike[+strike_index]]}!. The crowd is ecstatic, ${team[+!toss_index].name[current_bowler]} is absolutely flabbergasted.`);
                }

                strike_index = !strike_index;
                data.match.commentary.push('Last over:');
                runs_conceded[current_bowler] += previous_over;

                if (previous_over)
                {
                    data.match.commentary[data.match.commentary.length - 1] += `${previous_over} run${(previous_over > 1) ? 's' : ''}`;
                }
                else if (j === 7)
                {
                    maidens[current_bowler] += 1;
                    data.match.commentary[data.match.commentary.length - 1] += 'maiden';
                }

                data.team[+toss_index].scored_per_over[i] = (data.team[+toss_index].scored_per_over[i] * data.team[+toss_index].played + previous_over) / (data.team[+toss_index].played + 1);
                data.team[+!toss_index].conceded_per_over[i] = (data.team[+!toss_index].conceded_per_over[i] * data.team[+!toss_index].played + previous_over) / (data.team[+!toss_index].played + 1);
                data.match.commentary.push(`Current score: ${Total[+toss_index]} / ${wickets[+toss_index]}  Runrate: ${(Total[+toss_index] / (i + 1)).toFixed(2)}`);

                if ((Total[+toss] > Total[+!toss]) && loop)
                {
                    Overs[+toss] = i * 6 + j;
                    break;
                }
                if (loop)
                {
                    data.match.commentary.push(`RRR: ${parseFloat(((Total[+!toss] + 1 - Total[+toss]) / (19 - i))).toFixed(2)}  Equation: ${data.team[+toss_index]._id} needs ${Total[+!toss] + 1 - Total[+toss]} runs from ${114 - 6 * i} balls with ${10 - wickets[+toss]} wickets remaining`);
                }
                if (strike[+strike_index] < 11)
                {
                    data.match.commentary.push(`${team[+toss_index].name[strike[+strike_index]]} : ${score[strike[+strike_index]]} (${balls[strike[+strike_index]]}), Control: ${(control[strike[+strike_index]] * 100).toFixed(2)} %`);
                }
                if (strike[+!strike_index] < 11)
                {
                    data.match.commentary.push(`${team[+toss_index].name[strike[+!strike_index]]} : ${score[strike[+!strike_index]]} (${balls[strike[+!strike_index]]}), Control: ${(control[strike[+!strike_index]] * 100).toFixed(2)} %`);
                    data.match.commentary.push(`Partnership: ${partnership_runs[current_partnership_index]} (${partnership_balls[current_partnership_index]}), runrate: ${((partnership_runs[current_partnership_index] * 6) / (partnership_balls[current_partnership_index] || 1)).toFixed(2)}`);
                }
                if (previous_batsman > -1)
                {
                    data.match.commentary.push(`Previous Wicket: ${team[+toss_index].name[previous_batsman]}: ${score[previous_batsman]} (${balls[previous_batsman]}) Control: ${(control[previous_batsman] * 100).toFixed(2)} %`);

                    if (previous_dismissal > -1)
                    {
                        data.match.commentary.push(`Dismissed by: ${team[+!toss_index].name[previous_dismissal]}`);
                    }
                    else
                    {
                        data.match.commentary[data.match.commentary.length - 1] += '(runout)';
                    }

                    data.match.commentary.push(`Partnership: ${partnership_runs[previous_partnership_index]} (${partnership_balls[previous_partnership_index]}), runrate: ${(partnership_runs[previous_partnership_index] * 6 / (partnership_balls[previous_partnership_index] || 1)).toFixed(2)} Fall of wicket: ${fall_of_wicket} overs`);
                }

                data.match.commentary.push(`${team[+!toss_index].name[current_bowler]}: ${parseInt(deliveries[current_bowler] / 6, 10)}.${deliveries[current_bowler] % 6}-${maidens[current_bowler]}-${wickets_taken[current_bowler]}-${runs_conceded[current_bowler]}-${(runs_conceded[current_bowler] * 6 / deliveries[current_bowler]).toFixed(2)}`);

                if ((i < 19) && ((Total[+!toss] + 1 - Total[+toss]) / (19 - i) > 36) && hope && loop)
                {
                    hope = false;
                    data.match.commentary.push(rand(hopeless).replace('\t', data.team[+toss_index]._id));
                }

                if (deliveries[current_bowler] === 24)
                {
                    data.match.commentary.push(`And that brings an end to ${team[+!toss_index].name[current_bowler]}\'s spell.`);
                }

                last_five_overs.unshift(previous_over); // unshift adds a new element at the beginning of the array

                if (i > 3)
                {
                    temp = last_five_overs.reduce((a, b) => a + b, 0);
                    data.match.commentary.push(`Last 5 overs: ${last_five_overs}, ${temp} runs, runrate: ${(temp / 5).toFixed(2)}`);
                    last_five_overs.pop();
                }

                for (j = 0; j < 11; ++j)
                {
                    if (deliveries[j] <= 18 && j !== previous_bowler)
                    {
                        temp = j;
                        break;
                    }
                }

                current_bowler = temp;

                for (j = temp + 1; j < 11; ++j)
                {
                    if (deliveries[j] <= 18 && team[+!toss_index].bowl_rating[j] > team[+!toss_index].bowl_rating[current_bowler] && j !== previous_bowler)
                    {
                        current_bowler = j;
                    }
                }

                previous_bowler = current_bowler;
            }

            j = 0;
            hope = true;
            data.match.commentary.push(rand(loop ? end : mid));

            for (i = 0; i < data.team[+toss_index].squad.length; ++i)
            {
                if (data.team[+toss_index].squad[i] > 'd')
                {
                    continue;
                }

                ++data.team[+toss_index].stats[data.team[+toss_index].squad[i]].matches;
                data.team[+toss_index].stats[data.team[+toss_index].squad[i]].catches += catches[i];

                if ((data.team[+toss_index].squad[i] < 'b') || (data.team[+toss_index].squad[i] > 'c' && data.team[+toss_index].squad[i] < 'd'))
                {
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].recent.push(score[j]);
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].runs_scored += score[j];
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].balls += balls[j];

                    if (dismissed[j])
                    {
                        ++data.team[+toss_index].stats[data.team[+toss_index].squad[i]].outs;
                    }
                    else if ((j === strike[+strike_index]) || (j === strike[+!strike_index]))
                    {
                        ++data.team[+toss_index].stats[data.team[+toss_index].squad[i]].notouts;
                    }

                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].strike_rate = parseFloat((data.team[+toss_index].stats[data.team[+toss_index].squad[i]].runs_scored * 100 / (data.team[+toss_index].stats[data.team[+toss_index].squad[i]].balls || 1)).toFixed(2));
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].average = parseFloat((data.team[+toss_index].stats[data.team[+toss_index].squad[i]].runs_scored / (data.team[+toss_index].stats[data.team[+toss_index].squad[i]].outs || 1)).toFixed(2));

                    if (data.team[+toss_index].stats[data.team[+toss_index].squad[i]].high < score[j])
                    {
                        data.team[+toss_index].stats[data.team[+toss_index].squad[i]].high = score[j];
                    }
                    if (data.team[+toss_index].stats[data.team[+toss_index].squad[i]].low > score[j])
                    {
                        data.team[+toss_index].stats[data.team[+toss_index].squad[i]].low = score[j];
                    }

                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].fours += fours[j];
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].sixes += maximums[j++];
                }
            }

            j = 0;

            for (i = 0; i < data.team[+!toss_index].squad.length; ++i)
            {
                if (data.team[+!toss_index].squad[i] > 'b' && data.team[+!toss_index].squad[i] < 'd')
                {
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].overs += deliveries[i];
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].runs_given += runs_conceded[i];
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].wickets_taken += wickets_taken[i];
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].sr = parseFloat((data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].overs / (data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].wickets_taken || 1)).toFixed(2));
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].economy = parseFloat((data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].runs_given * 6 / (data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].overs || 1)).toFixed(2));
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].avg = parseFloat((data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].runs_given / (data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].wickets_taken || 1)).toFixed(2));
                }
            }

            temp = 0;

            if(balls[strike[+strike_index]])
            {
                for (j = 0; j < 11; ++j)
                {
                    temp += balls_faced[+strike_index][j] * team[+!toss_index].bowl_rating[j];
                }

                temp /= balls[strike[+strike_index]];
                temp -= team[+toss_index].bat_rating[strike[+strike_index]];
                temp /= 10;
                temp = (score[strike[+strike_index]] + 1) * (1 - Math.exp((temp - (Math.pow(fours[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])) + Math.pow(maximums[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])))) / (balls[strike[+strike_index]] + team[+toss_index].bat_rating[strike[+strike_index]])));
                data.team[+toss_index].stats[data.team[+toss_index].squad[strike[+strike_index]]].points += temp;

                if (MoM.points < temp)
                {
                    MoM.team = +toss_index;
                    MoM.points = Math.round(temp);
                    MoM.id = strike[+strike_index];
                }
            }

            k = 0;
            data.match.scorecard.push(' Scorecard:');
            data.match.scorecard.push(['Runs', 'Balls', 'Strike Rate', 'Fours', 'Sixes', 'Dot balls', 'Control (%)']);

            for (i = 0; i < 11; ++i)
            {
                if (!balls[i] && !dismissed[i])
                {
                    data.match.scorecard.push([team[+toss_index].name[i], ' DNB ']);
                }
                else
                {
                    data.match.scorecard.push([team[+toss_index].name[i], score[i], balls[i], (score[i] * 100 / balls[i]).toFixed(2), fours[i], maximums[i], dot_balls[i], (control[i] * 100).toFixed(2)]);

                    if (!dismissed[i])
                    {
                        data.match.scorecard[data.match.scorecard.length - 1].push('  (not out)');
                    }
                }
                if (i < 10)
                {
                    if (partnership_runs[i] > data.team[+toss_index].best_partnership_runs[i])
                    {
                        data.team[+toss_index].best_partnership_runs[i] = partnership_runs[i];
                        data.team[+toss_index].best_partnership_balls[i] = partnership_balls[i];
                    }
                    if (partnership_runs[i] < data.team[+toss_index].worst_partnership_runs[i])
                    {
                        data.team[+toss_index].worst_partnership_runs[i] = partnership_runs[i];
                        data.team[+toss_index].worst_partnership_balls[i] = partnership_balls[i];
                    }

                    partnership_runs[i] = partnership_balls[i] = 0;
                }

                k += fours[i] * 4 + maximums[i] * 6;
                data.team[+toss_index].f += fours[i];
                data.team[+toss_index].s += maximums[i];
                data.team[+toss_index].fours += fours[i];
                data.team[+toss_index].sixes += maximums[i];
                balls[i] = fours[i] = maximums[i] = dismissed[i] = milestone[i] = score[i] = balls[i] = fours[i] = maximums[i] = control[i] = catches[i] = dot_balls[i] = 0;
            }

            data.match.scorecard.push(`Total: ${Total[+toss_index]} / ${wickets[+toss_index]} (${parseInt(Overs[+toss_index] / 6, 10)}.${Overs[+toss_index] % 6} overs)  Runrate: ${(Total[+toss_index] * 6 / (Overs[+toss_index] ? Overs[+toss_index] : 1)).toFixed(2)} Extras: ${extras}`);
            data.match.scorecard.push(`Runs scored in boundaries: ${k} of ${Total[+toss_index]} (${(k * 100 / Total[+toss_index]).toFixed(2)} %) `);
            data.match.scorecard.push('Bowling Statistics:');
            data.match.scorecard.push(['Bowler', 'Overs', 'Maidens', 'Wickets', 'Runs conceded', 'Economy']);
            j = 0;

            for (i = 0; i < 11; ++i)
            {
                if(deliveries[i])
                {
                    ++j;
                    temp = 0;

                    for (k = 0; k < 11; ++k)
                    {
                        temp += deliveries_bowled[i][k] * team[+toss_index].bat_rating[k];
                    }

                    temp /= deliveries[i];
                    temp -= team[+!toss_index].bowl_rating[i];
                    temp /= 10;
                    temp = ((wickets_taken[i] + 1) * 25) * (1 - Math.exp((temp - Math.pow((dot_deliveries[i] + 1) * 100, wickets_taken[i])) / (team[+!toss_index].bowl_rating[i] + deliveries[i] + runs_conceded[i])));
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].points += temp;

                    if (MoM.points < temp)
                    {
                        MoM.team = +!toss_index;
                        MoM.points = Math.round(temp);
                        MoM.id = i;
                    }

                    data.match.scorecard.push([team[+!toss_index].name[i], parseInt(deliveries[i] / 6, 10).toString() + '.' + (deliveries[i] % 6).toString(), maidens[i], wickets_taken[i], runs_conceded[i], (runs_conceded[i] * 6 / (deliveries[i] ? deliveries[i] : 1)).toFixed(2)]);
                    five_wicket_haul[i] = continuous_wickets[i] = deliveries[i] = maidens[i] = runs_conceded[i] = wickets_taken[i] = dot_deliveries[i] = 0;
                    deliveries_bowled[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                }
            }

            count[loop] = j;
            frustration = [0, 0];
            last_five_overs = [];
            previous_batsman = previous_partnership_index = -1;
            balls_faced = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            data.match.scorecard.push('Fall of wickets: ');
            data.match.scorecard.push(wicket_sequence);
            data.match.scorecard.push(`Dot ball percentage: ${(dot * 100 / Overs[+toss_index]).toFixed(2)} %`);
            data.match.scorecard.push('   ');
            wicket_sequence = [];
            toss_index = !toss_index;
            extras = strike_index = free_hit = current_partnership_index = dot = previous_bowler = 0;
        }

        data.match.count = count;

        if (Total[0] === Total[1])
        {
            if (wickets[0] === wickets[1])
            {
                if (Overs[0] === Overs[1])
                {
                    data.match.commentary.push('TIE !');
                    winner = -1;
                    temp =  Overs[0] * (team[1].mean_rating - team[0].mean_rating) / Total[0] / 600;

                    for(i = 0; i < 2; ++i)
                    {
                        ++data.team[i].tied;
                        ++data.team[i].points;
                        data.team[i].runs_for += Total[i];
                        data.team[i].balls_for += Overs[i];
                        data.team[i].runs_against += Total[i];
                        data.team[i].balls_against += Overs[i];
                        data.team[i].wickets_lost += wickets[i];
                        data.team[i].wickets_taken += wickets[i];
                        data.team[i].form += Math.pow(-1, i) * temp;
                        data.team[i].highest_total = Math.max(data.team[i].highest_total, Total[i]);
                        data.team[i].lowest_total = Math.min(data.team[i].lowest_total, Total[i]);
                        data.team[i].progression.push((data.team[i].progression[process.env.DAY - 2] || 0) + 1);
                        data.team[i].net_run_rate = (data.team[i].runs_for) / (data.team[i].balls_for);
                        data.team[i].net_run_rate -= (data.team[i].runs_against) / (data.team[i].balls_against);
                        data.team[i].net_run_rate = parseFloat((data.team[i].net_run_rate * 6).toFixed(4));
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
                data.match.commentary[data.match.commentary.length - 1] += `${(Total[+!toss] - Total[+toss])} runs!`;
            }
        }
        if (parseInt(winner, 10) !== -1)
        {
            temp = ((((Overs[+winner] * mean_rating[+!winner]) / (Total[+winner] || 1))));
            temp -= (((Overs[+!winner] * mean_rating[+winner]) / (Total[+!winner] || 1)));
            temp /= 2000;

            for(i = 0; i < 2; ++i)
            {
                data.team[i].runs_for += Total[i];
                data.team[i].balls_for += Overs[i];
                data.team[i].scores.push(Total[i]);
                data.team[i].overs.push(Overs[i]);
                data.team[i].wickets.push(wickets[i]);
                data.team[i].runs_against += Total[+!i];
                data.team[i].balls_against += Overs[+!i];
                data.team[i].wickets_lost += wickets[i];
                data.team[i].wickets_taken += wickets[+!i];
                ++data.team[i][ref[+(i !== +winner)].prop];
                data.team[i].points += ref[+(i !== +winner)].points;
                data.team[i].run_rates.push((Total[i] * 6 / Overs[i]));
                data.team[i].form += Math.pow(-1, +(i !== +winner)) * temp;
                data.team[i].ratio = data.team[i].win / (data.team[i].loss || 1);
                data.team[i].lowest_total = Math.min(data.team[i].lowest_total, Total[i]);
                data.team[i].highest_total = Math.max(data.team[i].highest_total, Total[i]);
                data.team[i].net_run_rate = (data.team[i].runs_for) / (data.team[i].balls_for);
                data.team[i].net_run_rate -= (data.team[i].runs_against) / (data.team[i].balls_against);
                data.team[i].net_run_rate = parseFloat((data.team[i].net_run_rate * 6).toFixed(4));
                data.team[i].progression.push((data.team[i].progression[process.env.DAY - 2] || 0) + ref[+(i !== +winner)].points);
                data.team[i].streak = ((Math.pow(-1, +(i !== +winner)) * data.team[i].streak < 0) ? 1 : (data.team[i].streak + Math.pow(-1, +(i !== +winner))));
            }
        }

        data.match.MoM = MoM;
        data.team[0].names = team[0].name;
        data.team[1].names = team[1].name;
        ++data.team[MoM.team].stats[data.team[MoM.team].ratings[MoM.id]._id].MoM;
        data.match.commentary.push('Man of the Match: ' + data.team[MoM.team].ratings[MoM.id].Name + ' (' + data.team[MoM.team]._id + ')');
        data.match.commentary.push(rand(((data.team[MoM.team].ratings[MoM.id].Type === 'bat') ? (mom.bat) : ((data.team[MoM.team].ratings[MoM.id].Type === 'bowl') ? (mom.bowl) : (mom.all)))));
        data.match.commentary.push(rand(end));
    }

    for(i = 0; i < 2; ++i)
    {
        ++data.team[i].played;
        data.team[i].squad.pop();
        delete data.team[i].ratings;
        data.team[i].avg_runs_for = Math.round(data.team[i].runs_for / data.team[i].played);
        data.team[i].avg_runs_against = Math.round(data.team[i].runs_against / data.team[i].played);
        data.team[i].avg_wickets_lost = Math.round(data.team[i].wickets_lost / data.team[i].played);
        data.team[i].avg_wickets_taken = Math.round(data.team[i].wickets_taken / data.team[i].played);
        data.team[i].avg_overs_for = Math.floor(data.team[i].balls_for / data.team[i].played / 6) + (Math.floor(data.team[i].balls_for / data.team[i].played) % 6) / 10;
        data.team[i].avg_overs_against = Math.ceil(data.team[i].balls_against / data.team[i].played / 6) + (Math.floor(data.team[i].balls_against / data.team[i].played) % 6) / 10;
    }

    console.timeEnd('sim');

    callback(null, {
        team1: data.team[0],
        team2: data.team[1],
        match: data.match
    });
};
