/*
    Created by Kunal Nagpal <kunagpal@gmail.com>
    GraVITas Premier League
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
exports.simulate = function (data, callback)
{
    console.log(data.team[0]._id + ' vs ' + data.team[1]._id);
    if (data.team[0].ratings.length < 12 && data.team[1].ratings.length < 12)
    {
        console.log('Both teams forfeit');
        ++data.team[0].loss;
        ++data.team[1].loss;
    }
    else if (data.team[0].ratings.length < 12)
    {
        console.log(data.team[0]._id + ' forfeits');
        ++data.team[1].win;
        ++data.team[0].loss;
        ++data.team[1].points;
    }
    else if (data.team[1].ratings.length < 12)
    {
        console.log(data.team[1]._id + ' forfeits');
        ++data.team[0].win;
        ++data.team[1].loss;
        ++data.team[0].points;
    }
    else
    {
        var rand = function(base, limit)
        {
            if(limit)
            {
                return base + ((limit > base) ? rand(limit - base) : 0);
            }
            else if(base)
            {
                return ((typeof(base) == 'object') ? base[rand(base.length)] : parseInt(Math.random() * 1000000000000000) % base);
            }
            else
            {
                return Math.random();
            }
        };
        var Make = function(team, arg)
        {
            this.bat_avg = [];
            this.economy = [];
            this.bowl_avg = [];
            this.bat_name = [];
            this.bowl_name = [];
            this.bowl_index = [];
            this.bat_rating = [];
            this.bowl_rating = [];
            this.bat_strike_rate = [];
            this.bowl_strike_rate = [];
            this.avg_bat_rating = 0;
            this.avg_bowl_rating = 0;
            this.coach_rating = team[11]['Rating (15)'] ? team[11]['Rating (15)'] : -50;
            for (i = 0; i < 11; ++i)
            {
                switch (team[i].Type)
                {
                    case 'bat':
                        this.bat_name.push(team[i]['Name']);
                        this.bat_avg.push(team[i]['Average']);
                        this.bat_rating.push(team[i]['Rating (900)']);
                        this.avg_bat_rating += team[i]['Rating (900)'];
                        this.bat_strike_rate.push(team[i]['Strike Rate']);
                        break;
                    case 'bowl':
                        this.bowl_index.push(i);
                        this.bowl_avg.push(team[i]['Avg']);
                        this.bat_name.push(team[i]['Name']);
                        this.bowl_name.push(team[i]['Name']);
                        this.economy.push(team[i]['Economy']);
                        this.bat_avg.push(team[i]['Average']);
                        this.bowl_strike_rate.push(team[i]['SR']);
                        this.bowl_rating.push(team[i]['Rating (900)']);
                        this.avg_bowl_rating += team[i]['Rating (900)'];
                        this.bat_strike_rate.push(team[i]['Strike Rate']);
                        this.bat_rating.push(900 - team[i]['Rating (900)']);
                        break;
                    case 'all':
                        this.bowl_index.push(i);
                        this.bowl_avg.push(team[i]['Avg']);
                        this.bat_name.push(team[i]['Name']);
                        this.bowl_name.push(team[i]['Name']);
                        this.bat_rating.push(team[i]['Bat']);
                        this.avg_bat_rating += team[i]['Bat'];
                        this.economy.push(team[i]['Economy']);
                        this.bat_avg.push(team[i]['Average']);
                        this.bowl_rating.push(team[i]['Bowl']);
                        this.avg_bowl_rating += team[i]['Bowl'];
                        this.bowl_strike_rate.push(team[i]['SR']);
                        this.bat_strike_rate.push(team[i]['Strike Rate']);
                        break;
                }
            }
            mean_rating[arg] = ( this.avg_bat_rating + this.avg_bowl_rating) / (this.bat_name.length + this.bowl_name.length);
            this.avg_bat_rating /= this.bat_name.length;
            this.avg_bowl_rating /= this.bowl_name.length;
            for(i = 0; i < this.bowl_rating.length; ++i)
            {
                this.bowl_rating[i] += parseFloat(this.bowl_rating[i] ) / (this.bowl_name.length - 1) - parseFloat(this.avg_bowl_rating) / (this.bowl_name.length * (this.bowl_name.length - 1)) + parseInt(this.coach_rating);
                this.bowl_rating[i] = (this.bowl_rating[i] < 0) ? ((this.coach_rating < 0) ? (0) : (this.coach_rating)) : (this.bowl_rating[i]);
            }
            for(i = 0; i < this.bat_rating.length; ++i)
            {
                this.bat_rating[i] += parseFloat(this.bat_rating[i] ) / (this.bat_name.length - 1) - parseFloat(this.avg_bat_rating) / (this.bat_name.length * (this.bat_name.length - 1)) + parseInt(this.coach_rating);
                this.bat_rating[i] = (this.bat_rating[i] < 0) ? ((this.coach_rating < 0) ? (0) : (this.coach_rating)) : (this.bat_rating[i]);
            }
        };
        var path = require('path');
        var cnb = require(path.join(__dirname, 'commentary', 'out', 'cnb'));
        var lbw = require(path.join(__dirname, 'commentary', 'out', 'lbw'));
        var caught = require(path.join(__dirname, 'commentary', 'out', 'caught'));
        var bowled = require(path.join(__dirname, 'commentary', 'out', 'bowled'));
        var runout = require(path.join(__dirname, 'commentary', 'out', 'runout'));
        var stumped = require(path.join(__dirname, 'commentary', 'out', 'stumped'));
        var mom = require(path.join(__dirname, 'commentary', 'misc', 'mom'));
        var mid = require(path.join(__dirname, 'commentary', 'misc', 'mid'));
        var end = require(path.join(__dirname, 'commentary', 'misc', 'end'));
        var half = require(path.join(__dirname, 'commentary', 'misc', 'half'));
        var full = require(path.join(__dirname, 'commentary', 'misc', 'full'));
        var miss = require(path.join(__dirname, 'commentary', 'misc', 'miss'));
        var start = require(path.join(__dirname, 'commentary', 'misc', 'start'));
        var one = require(path.join(__dirname, 'commentary', 'score', 'one'));
        var two = require(path.join(__dirname, 'commentary', 'score', 'two'));
        var six = require(path.join(__dirname, 'commentary', 'score', 'six'));
        var zero = require(path.join(__dirname, 'commentary', 'score', 'dot'));
        var four = require(path.join(__dirname, 'commentary', 'score', 'four'));
        var three = require(path.join(__dirname, 'commentary', 'score', 'three'));
        var wide = require(path.join(__dirname, 'commentary', 'extra', 'wide'));
        var freehit = require(path.join(__dirname, 'commentary', 'extra', 'freehit'));
        var MoM = {};
        var bat =    // decrease to strengthen batting
        [
            [1100, 1100],
            [1100, 1100]
        ];
        var Total = [0, 0];
        var strike = [0, 1];
        var wickets = [0, 0];
        var mean_rating = [];
        var desperation = [];
        var team_object = [];
        var Overs = [120, 120];
        var bowl =      // increase to strengthen bowling
        [
            [1200, 1200, 1200],
            [1200, 1200, 1200]
        ];
        var frustration = [0,0];
        var wicket_sequence = [];
        var last_five_overs = [];
        var maidens = [0, 0, 0, 0, 0, 0];
        var deliveries = [0, 0, 0, 0, 0, 0];
        var deliveries_bowled =
        [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        var runs_conceded = [0, 0, 0, 0, 0, 0];
        var wickets_taken = [0, 0, 0, 0, 0, 0];
        var dot_deliveries = [0, 0, 0, 0, 0, 0];
        var five_wicket_haul = [0, 0, 0, 0, 0, 0];
        var continuous_wickets = [0, 0, 0, 0, 0, 0];
        var score = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var fours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var control = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var catches = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var maximums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var dot_balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var dismissed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var milestone = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var form = ['poor', 'average', 'good', 'excellent'];
        var partnership_runs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var partnership_balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var balls_faced = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
        var wicket_reference = ['c', 'b' , 'lbw', 'cnb', 'st'];
        var i;
        var j;
        var k;
        var hope;
        var loop;
        var winner;
        var dot = 0;
        var extras = 0;
        var toss_index;
        var points = 0;
        var free_hit = 0;
        var strike_index;
        var wicket_index;
        var fall_of_wicket;
        var delivery_score;
        var current_bowler;
        var toss = rand(2);
        var bat_perf_index;
        var previous_bowler;
        var bowl_perf_index;
        var previous_over = 0;
        var continuous_maximums;
        var previous_batsman = -1;
        var previous_dismissal = -1;
        var current_partnership_index = 0;
        var previous_partnership_index = -1;
        var temp = (data.team[0].form - data.team[1].form) / 2;
        team_object[0] = new Make(data.team[0].ratings,0);
        team_object[1] = new Make(data.team[1].ratings,1);
        data.match.commentary = [];
        data.match.commentary.push(data.team[0]._id + ' versus ' + data.team[1]._id);
        ++data.team[toss].toss;
        temp = (parseFloat(mean_rating[0] * 100) / (mean_rating[0] + mean_rating[1]) + temp).toFixed(2);
        data.match.commentary.push(' Winning chances: ');
        data.match.commentary.push(data.team[0]._id + ' :' + temp + ' %, ' + data.team[1]._id + ' :' + (100 - temp) + ' %');
        data.match.commentary.push(' Form: ');
        if(data.team[0].played && data.team[1].played)
        {
            data.match.commentary.push(data.team[0]._id + ': ' + form[parseInt(data.team[0].form * 100 / mean_rating[0])] + ' ' + data.team[1]._id + ': ' + form[parseInt(data.team[1].form * 100 / mean_rating[1])]);
        }
        data.match.commentary.push(rand(start));
        data.match.commentary.push(' Toss:' + data.team[toss]._id + ' wins the toss and chooses to ');
        if (rand(2))
        {
            data.match.commentary[data.match.commentary.length - 1] += 'bowl ';
        }
        else
        {
            toss = !toss;
            data.match.commentary[data.match.commentary.length - 1] += 'bat ';
        }
        data.match.commentary[data.match.commentary.length - 1] += 'first  ';
        data.match.commentary.push('Batting orders:');
        data.match.commentary.push(data.team[+!toss]._id + ' | ' + data.team[+toss]._id);
        for(i = 0; i < 11; ++i)
        {
            data.match.commentary.push(data.team[+!toss].ratings[i].Name + '(' + data.team[+!toss].ratings[i].Type + ') | ' + data.team[+toss].ratings[i].Name + '(' + (data.team[+toss].ratings[i].Type) + ')');
        }
        strike_index = previous_bowler = 0;
        toss_index = !toss;
        for(loop = 0; loop < 2; ++loop)
        {
            desperation[0] = +(data.team[+toss_index].streak < 0) * (1 - team_object[+toss_index].bat_rating[strike[0]] / 1000) * data.team[+toss_index].streak * ((Total[+!toss] + 1) / 5000) * mean_rating[+!toss_index] / team_object[+toss_index].bat_strike_rate[strike[0]];
            desperation[1] = +(data.team[+toss_index].streak < 0) * (1 - team_object[+toss_index].bat_rating[strike[1]] / 1000) * data.team[+toss_index].streak * ((Total[+!toss] + 1) / 5000) * mean_rating[+!toss_index] / team_object[+toss_index].bat_strike_rate[strike[1]];
            for (i = 1; i < 6; i++)
            {
                if (team_object[+!toss_index].bowl_rating[i] > team_object[+!toss_index].bowl_rating[previous_bowler])
                {
                    previous_bowler = i;
                }
            }
            current_bowler = previous_bowler;
            data.match.commentary.push('  ' + team_object[+!toss_index].bowl_name[previous_bowler] + ' to start proceedings from the pavillion end.....  ');
            for (i = 0; i < 20 && (wickets[+toss_index] < 10 && (Total[+toss] <= Total[+!toss])); ++i)
            {
                previous_over = continuous_maximums = 0;
                if (deliveries[current_bowler] == 18)
                {
                    data.match.commentary.push(' So the captain has chosen to bowl ' + team_object[+!toss_index].bowl_name[current_bowler] + ' out. ');
                }
                if ((score[strike[+strike_index]] >= 44 && score[strike[+strike_index]] < 50) || (loop && hope))
                {
                    data.match.commentary.push('  ' + team_object[+toss_index].bat_name[strike[+strike_index]] + ' one hit away from a well deserving fifty. Will he make it ?  ');
                }
                else if ((score[strike[+strike_index]] >= 94 && score[strike[+strike_index]] < 100))
                {
                    data.match.commentary.push('  ' + team_object[+toss_index].bat_name[strike[+strike_index]] + ' knows there is a hundred for the taking if he can knuckle this one down....  ');
                }
                for (j = 1; j <= 6; ++j)
                {
                    delivery_score = team_object[+toss_index].bat_rating[strike[+strike_index]] - team_object[+!toss_index].bowl_rating[current_bowler];
                    bowl_perf_index = (team_object[+!toss_index].bowl_rating[current_bowler]) / ((rand(team_object[+!toss_index].bowl_avg[strike[+strike_index]] * team_object[+!toss_index].bowl_rating[current_bowler] / bowl[+!toss_index][0] + 1) + team_object[+!toss_index].bowl_avg[current_bowler] * team_object[+!toss_index].bowl_rating[current_bowler] / 1000) * (rand(team_object[+!toss_index].bowl_strike_rate[current_bowler] * team_object[+!toss_index].bowl_rating[current_bowler] / bowl[+!toss_index][1] + 1) + team_object[+!toss_index].bowl_strike_rate[current_bowler] * team_object[+!toss_index].bowl_rating[current_bowler] / 1000) * (rand(team_object[+!toss_index].economy[current_bowler] * team_object[+!toss_index].bowl_rating[current_bowler] / bowl[+!toss_index][2] + 1) + team_object[+!toss_index].economy[current_bowler] * team_object[+!toss_index].bowl_rating[current_bowler] / 1000));
                    bat_perf_index = (rand(team_object[+toss_index].bat_avg[strike[+strike_index]] * team_object[+toss_index].bat_rating[strike[+strike_index]] / bat[+toss_index][0] + 1) + team_object[+toss_index].bat_avg[strike[+strike_index]] * (1000 - team_object[+toss_index].bat_rating[strike[+strike_index]]) / 1000) * (rand(team_object[+toss_index].bat_strike_rate[strike[+strike_index]] * team_object[+toss_index].bat_rating[strike[+strike_index]] / bat[+toss_index][1] + 1) + team_object[+toss_index].bat_strike_rate[strike[+strike_index]] * (1000 - team_object[+toss_index].bat_rating[strike[+strike_index]]) / 1000) / team_object[+!toss_index].bowl_rating[current_bowler];// + Math.pow(-1, rand(2)) * ((frustration[strike_index] >= 3) ? frustration[strike_index] : 0);
                    if (!delivery_score)
                    {
                        delivery_score = 1;
                    }
                    delivery_score += 1;
                    if (bat_perf_index > bowl_perf_index)
                    {
                        bat_perf_index += (rand(delivery_score)) / 100;
                    }
                    else
                    {
                        bat_perf_index -= (rand(delivery_score)) / 100;
                    }
                    ++deliveries[current_bowler];
                    ++balls[strike[+strike_index]];
                    ++balls_faced[+strike_index][current_bowler];
                    ++partnership_balls[current_partnership_index];
                    ++deliveries_bowled[current_bowler][strike[+strike_index]];
                    if(free_hit)
                    {
                        data.match.commentary.push(' Free Hit: ');
                    }
                    else
                    {
                        data.match.commentary.push(i + '.' + j + ' ' + team_object[+!toss_index].bowl_name[current_bowler] + ' to ' + team_object[+toss_index].bat_name[strike[+strike_index]] + ', ');
                    }
                    if (bat_perf_index <= 0 && !free_hit)
                    {
                        previous_batsman = strike[+strike_index];
                        dismissed[strike[+strike_index]] = 1;
                        data.match.commentary[data.match.commentary.length - 1] += 'OUT ';
                        ++dot_deliveries[current_bowler];
                        previous_dismissal = current_bowler;
                        ++continuous_wickets[current_bowler];
                        previous_partnership_index = current_partnership_index;
                        ++wickets_taken[current_bowler];
                        temp = -1;
                        if (bat_perf_index <= 0 && bat_perf_index > -0.5)
                        {
                            data.match.commentary.push(rand(caught));
                            temp = parseInt(Math.abs(bat_perf_index * 22));
                            wicket_index = 0;
                        }
                        else if (bat_perf_index <= -0.5 && bat_perf_index > -1)
                        {
                            data.match.commentary.push(rand(bowled));
                            wicket_index = 1;
                        }
                        else if (bat_perf_index <= -1 && bat_perf_index > -1.5)
                        {
                            data.match.commentary.push(rand(lbw));
                            wicket_index = 2;
                        }
                        else if (bat_perf_index <= -1.5 && bat_perf_index > -2)
                        {
                            data.match.commentary.push(rand(cnb));
                            wicket_index = 3;
                        }
                        else if (bat_perf_index <= -2 && bat_perf_index > -2.5)
                        {
                            data.match.commentary.push(rand(stumped));
                            wicket_index = 4;
                        }
                        else
                        {
                            delivery_score = rand(3);
                            if (delivery_score)
                            {
                                data.match.commentary.push('  ' + delivery_score + '   run(s), ');
                                partnership_runs[current_partnership_index] += delivery_score;
                                score[strike[+strike_index]] += delivery_score;
                                previous_over += delivery_score;
                                Total[+toss_index] += delivery_score;
                                --dot_deliveries[current_bowler];
                            }
                            if (rand(2))
                            {
                                strike_index = !strike_index;
                            }
                            data.match.commentary.push(rand(runout));
                            previous_dismissal = -1;
                            continuous_wickets[current_bowler] = 0;
                            --wickets_taken[current_bowler];
                            if (Total[+toss] > Total[+!toss])
                            {
                                data.match.commentary.push(' What an emphatic victory ! ');
                                Overs[+toss] = i * 6 + j;
                                break;
                            }
                            else if ((Total[1] == Total[0]) && loop)
                            {
                                data.match.commentary.push('Scores are level...');
                            }
                        }
                        wicket_sequence.push(Total[+toss_index] + ' / ' + wickets[+toss_index] + ' ' + team_object[+toss_index].bat_name[strike[+strike_index]] + ' ' + team_object[+!toss_index].bowl_name[current_bowler] + ' Overs: ' + i + ' . ' + j);
                        if (balls[strike[+strike_index]] == 1)
                        {
                            data.match.commentary.push('First ball ');
                        }
                        if (!score[strike[+strike_index]])
                        {
                            data.match.commentary.push('For a duck !');
                        }
                        if (wickets_taken[current_bowler] == 5 && !five_wicket_haul[current_bowler])
                        {
                            five_wicket_haul[current_bowler] = 1;
                            data.match.commentary.push(', that brings up his five wicket haul, yet another tick in a list of accomplishments.');
                        }
                        if (score[strike[+strike_index]] >= 45 && score[strike[+strike_index]] < 50)
                        {
                            data.match.commentary.push(rand(miss.half).replace('/b', team_object[+toss_index].bat_name[strike[+strike_index]]));
                        }
                        else if (score[strike[+strike_index]] >= 90 && score[strike[+strike_index]] < 100) data.match.commentary.push(rand(miss.full));
                        if (continuous_wickets[current_bowler] == 3)
                        {
                            data.match.commentary.push(' And that is also a hattrick for ' + team_object[+!toss_index].bowl_name[current_bowler] + '! Fantastic bowling in the time of need.');
                            continuous_wickets[current_bowler] = 0;
                        }
                        data.match.commentary.push('  ' + team_object[+toss_index].bat_name[strike[+strike_index]]);
                        if (previous_dismissal > -1)
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' ' + wicket_reference[wicket_index] + ' ' + team_object[+!toss_index].bowl_name[current_bowler];
                            if(temp > -1)
                            {
                                data.match.commentary[data.match.commentary.length - 1] += data.team[+toss_index].ratings[temp].Name;
                                ++catches[temp];
                            }
                        }
                        else
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' runout';
                        }
                        if(balls[strike[+strike_index]])
                        {
                            control[strike[+strike_index]] *= ((balls[strike[+strike_index]] - 1) / (balls[strike[+strike_index]])).toFixed(2);
                        }
                        temp = 0;
                        for(j = 0; j < 6; ++j)
                        {
                            temp += balls_faced[+strike_index][j] * team_object[+!toss_index].bowl_rating[j];
                        }
                        temp /= balls[strike[+strike_index]];
                        temp -= team_object[+toss_index].bat_rating[strike[+strike_index]];
                        temp /= 10;
                        temp = (score[strike[+strike_index]] + 1) * (1 - Math.exp((temp - (Math.pow(fours[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])) + Math.pow(maximums[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])))) / (balls[strike[+strike_index]] + team_object[+toss_index].bat_rating[strike[+strike_index]])));
                        if(points < temp)
                        {
                            MoM.team = +toss_index;
                            points = Math.round(temp);
                            MoM.id = strike[+strike_index];
                        }
                        data.match.commentary.push(' ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ' balls' + ' ' + fours[strike[+strike_index]] + 'X4\'s ' + maximums[strike[+strike_index]] + 'X6\'s) SR: ' + (score[strike[+strike_index]] * 100 / balls[strike[+strike_index]]).toFixed(2) + 'Control: ' + (control[strike[+strike_index]] * 100).toFixed(2)  + '%');
                        data.match.commentary.push(' Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ')' + ', Runrate: ' + (partnership_runs[current_partnership_index] * 6 / (partnership_balls[current_partnership_index] ? partnership_balls[current_partnership_index] : 1))).toFixed(2);
                        ++current_partnership_index;
                        strike[+strike_index] = (strike[+strike_index] > strike[+!strike_index] ? strike[+strike_index] : strike[+!strike_index]) + 1;
                        desperation[+strike_index] = +(data.team[+toss_index].streak < 0) * (1 - team_object[+toss_index].bat_rating[strike[+strike_index]] / 1000) * data.team[+toss_index].streak * ((Total[+!toss] - Total[+toss] + 1) / 5000) * mean_rating[+!toss_index] / team_object[+toss_index].bat_strike_rate[strike[+strike_index]];
                        frustration[+strike_index] = 0;
                        control[strike[+strike_index]] = 0;
                        balls_faced[+strike_index] = [0, 0, 0, 0, 0, 0];
                        if (temp != -1 && rand(2))
                        {
                            strike_index = !strike_index;
                            data.match.commentary.push(' The two batsmen crossed over while the catch was being taken.');
                        }
                        if (wickets[+toss_index]++ == 9)
                        {
                            Overs[+toss_index] = 6 * i + j;
                            data.match.commentary.push(' And that wraps up the innings. ');
                            ++data.team[+toss_index].all_outs;
                            break;
                        }
                        bat_perf_index = i;
                        if (j == 6)
                        {
                            temp = 0;
                            ++bat_perf_index;
                        }
                        fall_of_wicket = Total[+toss_index] + ' / ' + wickets[+toss_index] + ', ' + bat_perf_index + '.' + temp;
                    }
                    else
                    {
                        delivery_score = parseInt(bat_perf_index);
                        if (delivery_score < 0)
                        {
                            delivery_score = 0;
                        }
                        continuous_wickets[current_bowler] = 0;
                        if (delivery_score > 6)
                        {
                            if (rand(2))
                            {
                                data.match.commentary.push(' wide, ' + rand(wide));
                            }
                            else
                            {
                                data.match.commentary.push(rand(freehit));
                                free_hit = 1;
                            }
                            --j;
                            ++extras;
                            ++Total[+toss_index];
                            delivery_score = 0;
                            --deliveries[current_bowler];
                            --balls[strike[+strike_index]];
                            ++partnership_runs[current_partnership_index];
                            --partnership_balls[current_partnership_index];
                            --deliveries_bowled[current_bowler][strike[+strike_index]];
                        }
                        else
                        {
                            if (free_hit)
                            {
                                free_hit = 0;
                            }
                            switch (delivery_score)
                            {
                                case 0:
                                    data.match.commentary.push('No run, ' + rand(zero));
                                    frustration[strike_index] += 1 - team_object[+toss_index].bat_rating[strike[strike_index]] / 1000;
                                    control[strike[+strike_index]] *= ((balls[strike[+strike_index]] - 1) / (balls[strike[+strike_index]])).toFixed(2);
                                    ++dot_deliveries[current_bowler];
                                    ++dot_balls[strike[+strike_index]];
                                    ++dot;
                                    break;
                                case 1:
                                    data.match.commentary.push('1 run, ' + rand(one));
                                    break;
                                case 2:
                                    data.match.commentary.push('2 runs, ' + rand(two));
                                    break;
                                case 3:
                                    data.match.commentary.push('3 runs, ' + rand(three));
                                    break;
                                case 4 || 5:
                                    delivery_score = 4;
                                    data.match.commentary.push('FOUR, ' + rand(four));
                                    ++fours[strike[+strike_index]];
                                    break;
                                case 6:
                                    data.match.commentary.push('SIX, ' + rand(six));
                                    ++maximums[strike[+strike_index]];
                                    ++continuous_maximums;
                                    break;
                                default:
                                    break;
                            }
                            if(delivery_score)
                            {
                                frustration[strike_index] -= Math.pow(2, delivery_score) / (1000 - team_object[+toss_index].bat_rating[strike[strike_index]]);
                                control[strike[+strike_index]] = ((control[strike[+strike_index]] * (balls[strike[+strike_index]] - 1) + 1) / (balls[strike[+strike_index]])).toFixed(2);
                            }
                            if (delivery_score != 6)
                            {
                                continuous_maximums = 0;
                            }
                            previous_over += delivery_score;
                            score[strike[+strike_index]] += delivery_score;
                            Total[+toss_index] += delivery_score;
                            partnership_runs[current_partnership_index] += delivery_score;
                        }
                        if ((Total[1] == Total[0]) && loop)
                        {
                            data.match.commentary.push(' Scores are level now... ');
                        }
                        else if (Total[+toss] > Total[+!toss])
                        {
                            data.match.commentary.push(' And they have done it! What an emphatic victory ! ');
                            Overs[+toss] = 6 * i + j;
                            break;
                        }
                        if (!milestone[strike[+strike_index]] && score[strike[+strike_index]] >= 50)
                        {
                            ++milestone[strike[+strike_index]];
                            data.match.commentary.push(rand(half));
                        }
                        else if (milestone[strike[+strike_index]] == 1 && score[strike[+strike_index]] >= 100)
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
                if (continuous_maximums == 6)
                {
                    data.match.commentary.push(' Six G.P.L maximums in the previous over ! What an effort by ' + team_object[+toss_index].bat_name[strike[+strike_index]] + '. The crowd is ecstatic, ' + team_object[+!toss_index].bowl_name[current_bowler] + ' is absolutely flabbergasted. ');
                }
                runs_conceded[current_bowler] += previous_over;
                strike_index = !strike_index;
                data.match.commentary.push(' Last over: ');
                if (previous_over)
                {
                    data.match.commentary[data.match.commentary.length - 1] += previous_over + ' run(s)';
                }
                else
                {
                    if (j == 7)
                    {
                        data.match.commentary[data.match.commentary.length - 1] += 'maiden';
                    }
                    maidens[current_bowler] += 1;
                }
                data.match.commentary.push('  Current score: ' + Total[+toss_index] + ' / ' + wickets[+toss_index] + '  Runrate: ' + (Total[+toss_index] / (i + 1)).toFixed(2));
                if (Total[+toss] > Total[+!toss])
                {
                    Overs[+toss] = i * 6 + j;
                    break;
                }
                if(loop)
                {
                    data.match.commentary.push(', RRR: ' + parseFloat(((Total[+!toss] + 1 - Total[+toss]) / (19 - i))).toFixed(2) + '  Equation: ' + data.team[+toss_index]._id + ' needs ' + (Total[+!toss] + 1 - Total[+toss]) + ' runs from ' + (114 - 6 * i) + ' balls with ' + (10 - wickets[+toss]) + ' wickets remaining');
                }
                if (strike[+strike_index] < 11)
                {
                    data.match.commentary.push(' ' + team_object[+toss_index].bat_name[strike[+strike_index]] + ' : ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + '), Control: ' + (control[strike[+strike_index]] * 100).toFixed(2) + '%');
                }
                if (strike[+!strike_index] < 11)
                {
                    data.match.commentary.push(' ' + team_object[+toss_index].bat_name[strike[+!strike_index]] + ' : ' + score[strike[+!strike_index]] + ' (' + balls[strike[+!strike_index]] + '), Control: ' + (control[strike[+!strike_index]] * 100).toFixed(2) +  ' %');
                    data.match.commentary.push(' Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + '), runrate: ' + (partnership_runs[current_partnership_index] * 6 / (partnership_balls[current_partnership_index] ? partnership_balls[current_partnership_index] : 1))).toFixed(2);
                }
                if (previous_batsman > -1)
                {
                    data.match.commentary.push(' Previous Wicket: ' + team_object[+toss_index].bat_name[previous_batsman] + ': ' + score[previous_batsman] + '(' + balls[previous_batsman] + ') Control: ' + (control[previous_batsman] * 100).toFixed(2));
                    if (previous_dismissal > -1)
                    {
                        data.match.commentary.push(', Dismissed by: ' + team_object[+!toss_index].bowl_name[previous_dismissal]);
                    }
                    else
                    {
                        data.match.commentary[data.match.commentary.length - 1] += '(runout)';
                    }
                    data.match.commentary.push(' Partnership: ' + partnership_runs[previous_partnership_index] + '(' + partnership_balls[previous_partnership_index] + '), runrate: ' + (partnership_runs[previous_partnership_index] * 6 / (partnership_balls[previous_partnership_index] ? partnership_balls[previous_partnership_index]: 1)).toFixed(2) + ' Fall of wicket: ' + fall_of_wicket);
                }
                data.match.commentary.push('  ' + team_object[+!toss_index].bowl_name[current_bowler] + ': ' + parseInt(deliveries[current_bowler] / 6) + '.' + deliveries[current_bowler] % 6 + '-' + maidens[current_bowler] + '-' + wickets_taken[current_bowler] + '-' + runs_conceded[current_bowler] + '-' + (runs_conceded[current_bowler] * 6 / deliveries[current_bowler]).toFixed(2) + '  ');
                if ((i < 19) && ((Total[+!toss] + 1 - Total[+toss]) / (19 - i) > 36) && hope && loop)
                {
                    data.match.commentary.push(data.team[+toss_index]._id + ' might as well hop onto the team bus now.... ');
                    hope = false;
                }
                if (deliveries[current_bowler] == 24)
                {
                    data.match.commentary.push('And that brings an end to ' + team_object[+!toss_index].bowl_name[current_bowler] + '\'s spell.  ');
                }
                last_five_overs.unshift(previous_over);
                if(i > 3)
                {
                    temp = last_five_overs[0] + last_five_overs[1] + last_five_overs[2] + last_five_overs[3] + last_five_overs[4];
                    data.match.commentary.push(' Last 5 overs: ' + last_five_overs + ', ' + temp + ' runs, runrate: ' + (parseFloat(temp) / 5).toFixed(2));
                    last_five_overs.pop();
                }
                for (j = 0; j < 6; ++j)
                {
                    if (deliveries[j] <= 18 && j != previous_bowler)
                    {
                        delivery_score = j;
                        break;
                    }
                }
                current_bowler = delivery_score;
                for (j = delivery_score + 1; j < 6; ++j)
                {
                    if (deliveries[j] <= 18 && team_object[+!toss_index].bowl_rating[j] > team_object[+!toss_index].bowl_rating[current_bowler] && j != previous_bowler)
                    {
                        current_bowler = j;
                    }
                }
                previous_bowler = current_bowler;
            }
            hope = true;
            temp = loop ? end : mid;
            data.match.commentary.push(rand(temp));
            j = 0;
            for(i = 0; i < data.team[+toss_index].squad.length; ++i)
            {
                if(data.team[+toss_index].squad[i] > 'd')
                {
                    continue;
                }
                ++data.team[+toss_index].stats[data.team[+toss_index].squad[i]].matches;
                data.team[+toss_index].stats[data.team[+toss_index].squad[i]].catches += catches[i];
                if((data.team[+toss_index].squad[i] < 'b') || (data.team[+toss_index].squad[i] > 'c' && data.team[+toss_index].squad[i] < 'd'))
                {
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].recent.push(score[j]);
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].runs_scored += score[j];
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].balls += balls[j];
                    if(dismissed[j])
                    {
                        ++data.team[+toss_index].stats[data.team[+toss_index].squad[i]].outs;
                    }
                    else if((j == strike[+strike_index]) || (j == strike[+!strike_index]))
                    {
                        ++data.team[+toss_index].stats[data.team[+toss_index].squad[i]].notouts;
                    }
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].strike_rate = data.team[+toss_index].stats[data.team[+toss_index].squad[i]].runs_scored * 100 / (data.team[+toss_index].stats[data.team[+toss_index].squad[i]].balls ? data.team[+toss_index].stats[data.team[+toss_index].squad[i]].balls : 1);
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].average = data.team[+toss_index].stats[data.team[+toss_index].squad[i]].runs_scored / (data.team[+toss_index].stats[data.team[+toss_index].squad[i]].outs ? data.team[+toss_index].stats[data.team[+toss_index].squad[i]].outs : 1);
                    if(data.team[+toss_index].stats[data.team[+toss_index].squad[i]].high < score[j])
                    {
                        data.team[+toss_index].stats[data.team[+toss_index].squad[i]].high = score[j];
                    }
                    if(data.team[+toss_index].stats[data.team[+toss_index].squad[i]].low > score[j])
                    {
                        data.team[+toss_index].stats[data.team[+toss_index].squad[i]].low = score[j];
                    }
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].fours += fours[j];
                    data.team[+toss_index].stats[data.team[+toss_index].squad[i]].sixes += maximums[j++];
                }
            }
            j = 0;
            for(i = 0; i < data.team[+!toss_index].squad.length; ++i)
            {
                if(data.team[+!toss_index].squad[i] > 'b' && data.team[+!toss_index].squad[i] < 'd')
                {
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].runs_given += runs_conceded[j];
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].wickets_taken += wickets_taken[j];
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].overs += deliveries[j++];
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].economy = data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].runs_given * 6 / (data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].overs ? data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].overs : 1);
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].avg = data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].runs_given / (data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].wickets_taken ? data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].wickets_taken : 1);
                    data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].sr = data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].overs / (data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].wickets_taken ? data.team[+!toss_index].stats[data.team[+!toss_index].squad[i]].wickets_taken : 1);
                }
            }
            temp = 0;
            for(j = 0; j < 6; ++j)
            {
                temp += balls_faced[+strike_index][j] * team_object[+!toss_index].bowl_rating[j];
            }
            temp /= balls[strike[+strike_index]];
            temp -= team_object[+toss_index].bat_rating[strike[+strike_index]];
            temp /= 10;
            temp = (score[strike[+strike_index]] + 1) * (1 - Math.exp((temp - (Math.pow(fours[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])) + Math.pow(maximums[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])))) / (balls[strike[+strike_index]] + team_object[+toss_index].bat_rating[strike[+strike_index]])));
            if(points < temp)
            {
                MoM.team = +toss_index;
                points = Math.round(temp);
                MoM.id = strike[+strike_index];
            }
            data.match.scorecard.push(' Scorecard:');
            data.match.scorecard.push(['Runs', 'Balls', 'Strike Rate', 'Fours', 'Sixes', 'Dot balls', 'Control']);
            k = 0;
            for (i = 0; i < 11; ++i)
            {
                if (!balls[i] && !dismissed[i])
                {
                    data.match.scorecard.push([team_object[+toss_index].bat_name[i], ' DNB ']);
                }
                else
                {
                    data.match.scorecard.push([team_object[+toss_index].bat_name[i], score[i], balls[i], (score[i] * 100 / balls[i]).toFixed(2), fours[i], maximums[i], dot_balls[i], (control[i] * 100).toFixed(2)]);
                    if (!dismissed[i])
                    {
                        data.match.scorecard[data.match.scorecard.length - 1].push('  (not out)');
                    }
                }
                if (i < 10)
                {
                    partnership_runs[i] = partnership_balls[i] = 0;
                }
                k += fours[i] * 4 + maximums[i] * 6;
                balls[i] = fours[i] = maximums[i] = dismissed[i] = milestone[i] = score[i] = balls[i] = fours[i] = maximums[i] = control[i] = catches[i] = dot_balls[i] = 0;
            }
            data.match.scorecard.push('Total: ' + Total[+toss_index] + ' / ' + wickets[+toss_index] + ' (' + parseInt(Overs[+toss_index] / 6) + '.' + Overs[+toss_index] % 6 + ' overs)  Runrate: ' + (Total[+toss_index] * 6 / (Overs[+toss_index] ? Overs[+toss_index] : 1)).toFixed(2) + ' Extras: ' + extras);
            data.match.scorecard.push(' Runs scored in boundaries: ' + k + ' of ' + Total[+toss_index] + ' (' + (k * 100 / Total[+toss_index]).toFixed(2) + ' %) ');
            data.match.scorecard.push(' Bowling Statistics:  ');
            data.match.scorecard.push(['Bowler', 'Overs', 'Maidens', 'Wickets', 'Runs conceded', 'Economy  ']);
            for (i = 0; i < 6; i++)
            {
                temp = 0;
                for(k = 0; k < 11; ++k)
                {
                    temp += deliveries_bowled[i][k] * team_object[+toss_index].bat_rating[k];
                }
                temp /= deliveries[i];
                temp -= team_object[+!toss_index].bowl_rating[i];
                temp /= 10;
                temp = ((wickets_taken[i] + 1) * 25) * (1 - Math.exp((temp - Math.pow((dot_deliveries[i] + 1) * 100 , wickets_taken[i])) / (team_object[+!toss_index].bowl_rating[i] + deliveries[i] + runs_conceded[i])));
                if(points < temp)
                {
                    MoM.team = +!toss_index;
                    points = Math.round(temp);
                    MoM.id = team_object[+!toss_index].bowl_index[i];
                }
                data.match.scorecard.push([team_object[+!toss_index].bowl_name[i], parseInt(deliveries[i] / 6).toString() + '.' + (deliveries[i] % 6).toString(), maidens[i], wickets_taken[i], runs_conceded[i], (runs_conceded[i] * 6 / (deliveries[i] ? deliveries[i] : 1)).toFixed(2)]);
                five_wicket_haul[i] = continuous_wickets[i] = deliveries[i] = maidens[i] = runs_conceded[i] = wickets_taken[i] = dot_deliveries[i] = 0;
                deliveries_bowled[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            }
            frustration = [0, 0];
            previous_batsman = previous_partnership_index = -1;
            balls_faced = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
            extras = strike_index = free_hit = current_partnership_index = dot = previous_bowler = 0;
            data.match.scorecard.push('Fall of wickets: ');
            data.match.scorecard.push(wicket_sequence);
            data.match.scorecard.push('Dot ball percentage: ' + (dot * 100 / Overs[+toss_index]).toFixed(2) + ' %');
            data.match.scorecard.push('   ');
            wicket_sequence = [];
            toss_index = !toss_index;
        }
        if (Total[0] == Total[1])
        {
            if (wickets[0] == wickets[1])
            {
                if (Overs[0] == Overs[1])
                {
                    data.match.commentary.push('TIE ! ');
                    if(data.team[0].highest_total < Total[0])
                    {
                        data.team[0].highest_total = Total[0];
                    }
                    if(data.team[0].lowest_total > Total[0])
                    {
                        data.team[0].lowest_total = Total[0];
                    }
                    if(data.team[1].highest_total < Total[0])
                    {
                        data.team[1].highest_total = Total[0];
                    }
                    if(data.team[1].lowest_total > Total[0])
                    {
                        data.team[1].lowest_total = Total[0];
                    }
                    winner = -1;
                    ++data.team[0].tied;
                    ++data.team[1].tied;
                    ++data.team[0].points;
                    ++data.team[1].points;
                    data.team[0].runs_for += Total[0];
                    data.team[1].runs_for += Total[0];
                    data.team[0].balls_for += Overs[0];
                    data.team[1].balls_for += Overs[0];
                    data.team[0].runs_against += Total[0];
                    data.team[1].runs_against += Total[0];
                    data.team[0].balls_against += Overs[0];
                    data.team[1].balls_against += Overs[0];
                    data.team[0].wickets_taken += wickets[0];
                    data.team[1].wickets_taken += wickets[0];
                    data.team[0].wickets_fallen += wickets[0];
                    data.team[1].wickets_fallen += wickets[0];
                    data.team[0].form += Overs[0] * (mean_rating[1] - mean_rating[0]) / Total[0] / 600;
                    data.team[1].form += Overs[0] * (mean_rating[0] - mean_rating[1]) / Total[0] / 600;
                    data.team[0].net_run_rate = (((data.team[0].runs_for) / (data.team[0].balls_for) - (data.team[0].runs_against) / (data.team[0].balls_against)) * 6).toFixed(2);
                    data.team[1].net_run_rate = (((data.team[1].runs_for) / (data.team[1].balls_for) - (data.team[1].runs_against) / (data.team[1].balls_against)) * 6).toFixed(2);
                }
                else
                {
                    winner = (Overs[+!toss] > Overs[+toss]) ? (+toss) : (+!toss);
                    data.match.commentary[data.match.commentary.length - 1] += data.team[+winner]._id + ' wins! (higher run rate)  ';
                }
            }
            else
            {
                winner = (wickets[+!toss] > wickets[+toss]) ? (+toss) : (+!toss);
                data.match.commentary[data.match.commentary.length - 1] += data.team[+winner]._id + ' wins! (fewer wickets lost)  ';
            }
        }
        else
        {
            winner = (Total[+toss] > Total[+!toss]) ? (+toss) : (+!toss);
            data.match.commentary.push(data.team[winner]._id + ' wins by ');
            if (Total[+!toss] < Total[+toss])
            {
                data.match.commentary[data.match.commentary.length - 1] += (10 - wickets[+toss]) + ' wicket(s) !';
            }
            else
            {
                data.match.commentary[data.match.commentary.length - 1] += (Total[+!toss] - Total[+toss]) + ' runs!';
            }
            data.match.commentary[data.match.commentary.length - 1] += ' ';
        }
        if (parseInt(winner) != -1)
        {
            if(data.team[+winner].highest_total < Total[+winner])
            {
                data.team[+winner].highest_total = Total[+winner];
            }
            if(data.team[+winner].lowest_total > Total[+winner])
            {
                data.team[+winner].lowest_total = Total[+winner];
            }
            if(data.team[+!winner].highest_total < Total[+!winner])
            {
                data.team[+!winner].highest_total = Total[+!winner];
            }
            if(data.team[+!winner].lowest_total > Total[+!winner])
            {
                data.team[+!winner].lowest_total = Total[+!winner];
            }
            ++data.team[+winner].win;
            ++data.team[+!winner].loss;
            data.team[+winner].points += 2;
            data.team[+winner].runs_for += Total[+winner];
            data.team[+winner].balls_for += Overs[+winner];
            data.team[+!winner].runs_for += Total[+!winner];
            data.team[+!winner].balls_for += Overs[+!winner];
            data.team[+winner].runs_against += Total[+!winner];
            data.team[+!winner].runs_against += Total[+winner];
            data.team[+winner].balls_against += Overs[+!winner];
            data.team[+!winner].balls_against += Overs[+winner];
            data.team[+winner].wickets_lost += wickets[+winner];
            data.team[+winner].wickets_taken += wickets[+!winner];
            data.team[+!winner].wickets_taken += wickets[+winner];
            data.team[+!winner].wickets_lost += wickets[+!winner];
            data.team[+winner].streak = (data.team[+winner].streak < 0) ? (1) : (data.team[+winner].streak + 1);
            data.team[+!winner].streak = (data.team[+!winner].streak > 0) ? (0) : (data.team[+!winner].streak - 1);
            data.team[+winner].ratio = data.team[+winner].win / (data.team[+winner].loss ? data.team[+winner].loss : 1 );
            data.team[+!winner].ratio = data.team[+!winner].win / (data.team[+!winner].loss ? data.team[+!winner].loss : 1);
            data.team[+winner].form += ((Overs[+winner] * mean_rating[+!winner] / Total[+winner]) - (Overs[+!winner] * mean_rating[+winner] / Total[+!winner])) / 600;
            data.team[+!winner].form += ((Overs[+!winner] * mean_rating[+winner] / Total[+!winner]) - (Overs[+winner] * mean_rating[+!winner] / Total[+winner])) / 600;
            data.team[+winner].net_run_rate = (((data.team[+winner].runs_for) / (data.team[+winner].balls_for) - (data.team[+winner].runs_against) / (data.team[+winner].balls_against)) * 6).toFixed(2);
            data.team[+!winner].net_run_rate = (((data.team[+!winner].runs_for) / (data.team[+!winner].balls_for) - (data.team[+!winner].runs_against) / (data.team[+!winner].balls_against)) * 6).toFixed(2);
        }
        ++data.team[MoM.team].stats[data.team[MoM.team].ratings[MoM.id]._id].MoM;
        data.match.commentary.push('Man of the Match: ' + data.team[MoM.team].ratings[MoM.id].Name + '( ' + data.team[MoM.team]._id + ')');
        temp = (data.team[MoM.team].ratings[MoM.id].Type == 'bat') ? (mom.bat) : ((data.team[MoM.team].ratings[MoM.id].Type == 'bowl') ? (mom.bowl) : (mom.all));
        data.match.commentary.push(rand(temp));
        data.match.commentary.push(rand(end));
    }
    ++data.team[0].played;
    ++data.team[1].played;
    data.team[0].squad.pop();
    data.team[1].squad.pop();
    delete data.team[0].ratings;
    delete data.team[1].ratings;
    data.team[0].avg_runs_for = Math.round(data.team[0].runs_for / data.team[0].played);
    data.team[1].avg_runs_for = Math.round(data.team[1].runs_for / data.team[1].played);
    data.team[0].avg_runs_against = Math.round(data.team[0].runs_against / data.team[0].played);
    data.team[1].avg_runs_against = Math.round(data.team[1].runs_against / data.team[1].played);
    data.team[0].avg_wickets_taken = Math.round(data.team[0].wickets_taken / data.team[0].played);
    data.team[1].avg_wickets_taken = Math.round(data.team[1].wickets_taken / data.team[1].played);
    data.team[0].avg_wickets_lost = Math.round(data.team[0].wickets_fallen / data.team[0].played);
    data.team[1].avg_wickets_lost = Math.round(data.team[1].wickets_fallen / data.team[1].played);
    data.team[0].avg_overs_for = Math.ceil(data.team[0].balls_for / data.team[0].played / 6) + (Math.floor(data.team[0].balls_for / data.team[0].played) % 6) / 10;
    data.team[1].avg_overs_for = Math.ceil(data.team[1].balls_for / data.team[1].played / 6) + (Math.floor(data.team[1].balls_for / data.team[1].played) % 6) / 10;
    data.team[0].avg_overs_against = Math.ceil(data.team[0].balls_against / data.team[0].played / 6) + (Math.floor(data.team[0].balls_against / data.team[0].played) % 6) / 10;
    data.team[1].avg_overs_against = Math.ceil(data.team[1].balls_against / data.team[1].played / 6) + (Math.floor(data.team[1].balls_against / data.team[1].played) % 6) / 10;
    var newData =
    {
        team1: data.team[0],
        team2: data.team[1],
        match: data.match
    };
    callback(null, newData);
};