/*
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
    if (data.team[0].ratings.length < 12 && data.team[1].ratings.length < 12)
    {
        console.log(data.team[0]._id + ' and ' + data.team[1]._id + ' forfeit the match');
        ++data.team[0].loss;
        ++data.team[1].loss;
    }
    else if (data.team[0].ratings.length < 12)
    {
        console.log(data.team[0]._id + ' forfeits the match, ' + data.team[1]._id + ' wins by default');
        ++data.team[1].win;
        data.team[1].points += 2;
        ++data.team[0].loss;
    }
    else if (data.team[1].ratings.length < 12)
    {
        console.log(data.team[1]._id + ' forfeits the match, ' + data.team[0]._id + ' wins by default');
        ++data.team[0].win;
        data.team[0].points += 2;
        ++data.team[1].loss;
    }
    else
    {
        console.log(data.team[0]._id + ' vs ' + data.team[1]._id + ' is now being simulated');
        function rand()
        {
            return parseInt(Math.random() * 1000000000000000);
        }
        function Make(team, arg)
        {
            var i;
            this.economy = [];
            this.bat_name = [];
            this.bowl_name = [];
            this.bat_rating = [];
            this.bowl_index = [];
            this.bat_average = [];
            this.bowler_count = 0;
            this.bowl_average = [];
            this.batsman_count = 0;
            this.bowler_rating = [];
            this.bat_strike_rate = [];
            this.bowl_strike_rate = [];
            this.average_bat_rating = 0;
            this.average_bowl_rating = 0;
            this.coach_rating = parseInt(team[11]['Rating (15)']) ? parseInt(team[11]['Rating (15)']) : -50;
            for (i = 0; i < 11; ++i)
            {
                switch (team[i].Type)
                {
                    case 'bat':
                        this.bat_name[this.batsman_count] = team[i]['Name'];
                        this.bat_average[this.batsman_count] = parseFloat(team[i]['Average']);
                        this.bat_rating[this.batsman_count] = parseInt(team[i]['Rating (900)']);
                        this.bat_strike_rate[this.batsman_count] = parseFloat(team[i]['Strike Rate']);
                        this.average_bat_rating = this.average_bat_rating + parseInt(team[i]['Rating (900)']);
                        ++this.batsman_count;
                        break;
                    case 'bowl':
                        this.economy[this.bowler_count] = parseFloat(team[i]['Economy']);
                        this.bowl_average[this.bowler_count] = parseFloat(team[i]['Avg']);
                        this.bowl_strike_rate[this.bowler_count] = parseFloat(team[i]['SR']);
                        this.bat_average[this.batsman_count] = parseFloat(team[i]['Average']);
                        this.bowler_rating[this.bowler_count] = parseInt(team[i]['Rating (900)']);
                        this.bat_strike_rate[this.batsman_count] = parseFloat(team[i]['Strike Rate']);
                        this.bat_rating[this.batsman_count] = 900 - parseInt(team[i]['Rating (900)']);
                        this.bowl_name[this.bowler_count] = this.bat_name[this.batsman_count] = team[i]['Name'];
                        this.average_bowl_rating = this.average_bowl_rating + parseInt(team[i]['Rating (900)']);
                        this.bowl_index.push(i);
                        ++this.bowler_count;
                        ++this.batsman_count;
                        break;
                    case 'all':
                        this.bowl_name[this.bowler_count] = team[i]['Name'];
                        this.bat_name[this.batsman_count] = team[i]['Name'];
                        this.average_bat_rating += parseInt(team[i]['Bat']);
                        this.average_bowl_rating += parseInt(team[i]['Bowl']);
                        this.bat_rating[this.batsman_count] = parseInt(team[i]['Bat']);
                        this.economy[this.bowler_count] = parseFloat(team[i]['Economy']);
                        this.bowler_rating[this.bowler_count] = parseInt(team[i]['Bowl']);
                        this.bowl_average[this.bowler_count] = parseFloat(team[i]['Avg']);
                        this.bowl_strike_rate[this.bowler_count] = parseFloat(team[i]['SR']);
                        this.bat_average[this.batsman_count] = parseFloat(team[i]['Average']);
                        this.bat_strike_rate[this.batsman_count] = parseFloat(team[i]['Strike Rate']);
                        ++this.batsman_count;
                        ++this.bowler_count;
                        break;
                }
            }
            mean_rating[arg] = ( this.average_bat_rating + this.average_bowl_rating ) / 17;
            this.average_bat_rating /= 11;
            this.average_bowl_rating /= 6;
            for (i = 0; i < 11; ++i)
            {
                if (i < 6)
                {
                    this.bowler_rating[i] += parseFloat(this.bowler_rating[i] ) / 5 - parseFloat(this.average_bowl_rating) / 30 + parseInt(this.coach_rating);
                }
                this.bat_rating[i] += parseFloat(this.bat_rating[i]) / 10 - parseFloat(this.average_bat_rating) / 110 + parseInt(this.coach_rating);
                this.bat_rating = (this.bat_rating < 0)? ((this.coach_rating < 0) ? (0) : (this.coach_rating)):(this.bat_rating);
            }
        }
        var path = require('path');
        var lbw = require(path.join(__dirname, 'commentary', 'out', 'lbw'));
        var mom = require(path.join(__dirname, 'commentary', 'misc', 'mom'));
        var mid = require(path.join(__dirname, 'commentary', 'misc', 'mid'));
        var end = require(path.join(__dirname, 'commentary', 'misc', 'end'));
        var one = require(path.join(__dirname, 'commentary', 'score', 'one'));
        var two = require(path.join(__dirname, 'commentary', 'score', 'two'));
        var six = require(path.join(__dirname, 'commentary', 'score', 'six'));
        var zero = require(path.join(__dirname, 'commentary', 'score', 'dot'));
        var half = require(path.join(__dirname, 'commentary', 'misc', 'half'));
        var full = require(path.join(__dirname, 'commentary', 'misc', 'full'));
        var miss = require(path.join(__dirname, 'commentary', 'misc', 'miss'));
        var four = require(path.join(__dirname, 'commentary', 'score', 'four'));
        var wide = require(path.join(__dirname, 'commentary', 'extra', 'wide'));
        var start = require(path.join(__dirname, 'commentary', 'misc', 'start'));
        var caught = require(path.join(__dirname, 'commentary', 'out', 'caught'));
        var bowled = require(path.join(__dirname, 'commentary', 'out', 'bowled'));
        var runout = require(path.join(__dirname, 'commentary', 'out', 'runout'));
        var three = require(path.join(__dirname, 'commentary', 'score', 'three'));
        var stumped = require(path.join(__dirname, 'commentary', 'out', 'stumped'));
        var freehit = require(path.join(__dirname, 'commentary', 'extra', 'freehit'));
        var MoM = {};
        var Total = [0, 0];
        var strike = [0, 1];
        var wickets = [0, 0];
        var mean_rating = [];
        var desperation = [];
        var team_object = [];
        var Overs = [120, 120];
        var bat = [1100, 1100];    // decrease to strengthen batting
        var frustration = [0,0];
        var wicket_sequence = [];
        var last_five_overs = [];
        var bowl = [1200, 1200, 1200]; // increase to strengthen bowling
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
        var i;
        var j;
        var dot;
        var winner;
        var extras = 0;
        var points = -1;
        var free_hit = 0;
        var strike_index;
        var fall_of_wicket;
        var delivery_score;
        var current_bowler;
        var previous_bowler;
        var toss = rand() % 2;
        var winner_index = -1;
        var previous_over = 0;
        var continuous_maximums;
        var previous_batsman = -1;
        var previous_dismissal = -1;
        var bowler_performance_index;
        var batsman_performance_index;
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
            data.match.commentary.push(data.team[0]._id + ': ' + form[data.team[0].form * 100 / mean_rating[0]] + ' ' + data.team[1]._id + ': ' + form[data.team[1].form * 100 / mean_rating[1]]);
        }
        data.match.commentary.push(start[rand() % start.length]);
        data.match.commentary.push(' Toss:' + data.team[toss]._id + ' wins the toss and chooses to ');
        if (rand() % 2)
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
            data.match.commentary.push(data.team[+!toss].ratings[i].Name + '(' + data.team[+!toss].ratings[i].Type + ') | (' + data.team[+toss].ratings[i].Name + (data.team[+toss].ratings[i].Type) + ')');
        }
        wickets[0] = wickets[1] = strike_index = previous_bowler = 0;
        for (i = 1; i < 6; ++i)
        {
            if (team_object[+toss].bowler_rating[i] > team_object[+toss].bowler_rating[previous_bowler])
            {
                previous_bowler = i;
            }
        }
        current_bowler = previous_bowler;
        data.match.commentary.push(start[rand() % start.length]);
        data.match.commentary.push(team_object[+toss].bowl_name[previous_bowler] + ' to start proceedings from the pavillion end.....  ');
        dot = 0;
        desperation[0] = +(data.team[+!toss].streak < 0) * (1 - team_object[+!toss].bat_rating[strike[0]] / 1000) * Math.abs(data.team[+!toss].streak) * (mean_rating[+toss]) / 1000;
        desperation[1] = +(data.team[+!toss].streak < 0) * (1 - team_object[+!toss].bat_rating[strike[1]] / 1000) * Math.abs(data.team[+!toss].streak) * (mean_rating[+toss]) / 1000;
        for (i = 0; i < 20 && wickets[0] < 10; ++i)
        {
            previous_over = continuous_maximums = 0;
            if (deliveries[current_bowler] == 18)
            {
                data.match.commentary.push('So the captain has chosen to bowl ' + team_object[+toss].bowl_name[current_bowler] + ' out. ');
            }
            if ((score[strike[+strike_index]] >= 44 && score[strike[+strike_index]] < 50))
            {
                data.match.commentary.push(team_object[+!toss].bat_name[strike[+strike_index]] + ' one hit away from a well deserving fifty. Will he make it ?  ');
            }
            else if ((score[strike[+strike_index]] >= 94 && score[strike[+strike_index]] < 100))
            {
                data.match.commentary.push(team_object[+!toss].bat_name[strike[+strike_index]] + ' knows there is a hundred for the taking if he can knuckle this one down....  ');
            }
            for (j = 1; j <= 6; ++j)
            {
                delivery_score = team_object[+!toss].bat_rating[strike[+strike_index]] - team_object[+toss].bowler_rating[current_bowler];
                bowler_performance_index = (team_object[+toss].bowler_rating[current_bowler]) / ((rand() % (team_object[+toss].bowl_average[strike[+strike_index]] * team_object[+toss].bowler_rating[current_bowler] / bowl[0] + 1) + team_object[+toss].bowl_average[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+toss].bowl_strike_rate[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / bowl[1] + 1) + team_object[+toss].bowl_strike_rate[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+toss].economy[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / bowl[2] + 1) + team_object[+toss].economy[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000));
                batsman_performance_index = (rand() % (team_object[+!toss].bat_average[strike[+strike_index]] * team_object[+!toss].bat_rating[strike[+strike_index]] / bat[0] + 1) + team_object[+!toss].bat_average[strike[+strike_index]] * (1000 - team_object[+!toss].bat_rating[strike[+strike_index]]) / 1000) * (rand() % (team_object[+!toss].bat_strike_rate[strike[+strike_index]] * team_object[+!toss].bat_rating[strike[+strike_index]] / bat[1] + 1) + team_object[+!toss].bat_strike_rate[strike[+strike_index]] * (1000 - team_object[+!toss].bat_rating[strike[+strike_index]]) / 1000) / team_object[+toss].bowler_rating[current_bowler] + Math.pow(-1, (rand() % 2)) * ((frustration[strike_index] >= 3) ? frustration[strike_index]: 0);
                if (!delivery_score)
                {
                    delivery_score = 1;
                }
                ++delivery_score;
                if (batsman_performance_index > bowler_performance_index)
                {
                    batsman_performance_index += (rand() % delivery_score) / 100;
                }
                else
                {
                    batsman_performance_index -= (rand() % delivery_score) / 100;
                }
                ++deliveries[current_bowler];
                ++balls[strike[+strike_index]];
                ++balls_faced[+strike_index][current_bowler];
                ++deliveries_bowled[current_bowler][strike[+strike_index]];
                ++partnership_balls[current_partnership_index];
                if (free_hit)
                {
                    data.match.commentary.push(' Free Hit: ');
                }
                else
                {
                    data.match.commentary.push(i + '.' + j + ' ' + team_object[+toss].bowl_name[current_bowler] + ' to ' + team_object[+!toss].bat_name[strike[+strike_index]] + ', ');
                }
                if (batsman_performance_index <= 0 && !free_hit)
                {
                    previous_batsman = strike[+strike_index];
                    dismissed[strike[+strike_index]] = 1;
                    data.match.commentary.push('OUT ');
                    ++dot_deliveries[current_bowler];
                    previous_dismissal = current_bowler;
                    ++continuous_wickets[current_bowler];
                    previous_partnership_index = current_partnership_index;
                    ++wickets_taken[current_bowler];
                    temp = -1;
                    if (batsman_performance_index <= 0 && batsman_performance_index > -0.5)
                    {
                        data.match.commentary.push(caught[rand() % caught.length]);
                        temp = parseInt(Math.abs(batsman_performance_index * 22));
                    }
                    else if (batsman_performance_index <= -0.5 && batsman_performance_index > -1)
                    {
                        data.match.commentary.push(bowled[rand() % bowled.length]);
                    }
                    else if (batsman_performance_index <= -1 && batsman_performance_index > -1.5)
                    {
                        data.match.commentary.push(lbw[rand() % lbw.length]);
                    }
                    else if (batsman_performance_index <= -1.5 && batsman_performance_index > -2)
                    {
                        data.match.commentary.push(stumped[rand() % stumped.length]);
                    }
                    else
                    {
                        delivery_score = rand() % 3;
                        if (delivery_score)
                        {
                            data.match.commentary.push('  ' + delivery_score + ' run(s), ');
                            partnership_runs[current_partnership_index] += delivery_score;
                            score[strike[+strike_index]] += delivery_score;
                            previous_over += delivery_score;
                            Total[0] += delivery_score;
                            --dot_deliveries[current_bowler];
                        }
                        if (rand() % 2)
                        {
                            strike_index = !strike_index;
                        }
                        data.match.commentary.push(runout[rand() % runout.length]);
                        previous_dismissal = -1;
                        continuous_wickets[current_bowler] = 0;
                        --wickets_taken[current_bowler];
                    }
                    wicket_sequence.push(Total[0] + ' / ' + wickets[0] + ' ' + team_object[+!toss].bat_name[strike[+strike_index]] + ' ' + team_object[+toss].bowl_name[current_bowler] +' Overs: ' + i + ' . ' + j);
                    if (balls[strike[+strike_index]] == 1)
                    {
                        data.match.commentary[data.match.commentary.length - 1] += ' first ball ';
                    }
                    if (!score[strike[+strike_index]])
                    {
                        data.match.commentary[data.match.commentary.length - 1] += ' for a duck ! ';
                    }
                    if (wickets_taken[current_bowler] == 5 && !five_wicket_haul[current_bowler])
                    {
                        five_wicket_haul[current_bowler] = 1;
                        data.match.commentary.push(', that brings up his five wicket haul, yet another tick in a list of accomplishments.');
                    }
                    if (score[strike[+strike_index]] >= 45 && score[strike[+strike_index]] < 50)
                    {
                        data.match.commentary.push(' looks like there won\'t be any fifty for ' + team_object[+!toss].bat_name[strike[+strike_index]] + ', he came so close, and was yet so far. ');
                    }
                    else if (score[strike[+strike_index]] >= 90 && score[strike[+strike_index]] < 100)
                    {
                        data.match.commentary.push(' He\'ll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team. ');
                    }
                    if (continuous_wickets[current_bowler] == 3)
                    {
                        data.match.commentary.push(' And that is also a hattrick for ' + team_object[+!toss].bowl_name[current_bowler] + '! Fantastic bowling in the time of need.');
                        continuous_wickets[current_bowler] = 0;
                    }
                    data.match.commentary.push('  ' + team_object[+!toss].bat_name[strike[+strike_index]]);
                    if (previous_dismissal > -1)
                    {
                        data.match.commentary.push(', ' + team_object[+toss].bowl_name[current_bowler]);
                        if(temp > -1)
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' caught ';
                            if(data.team[+toss].ratings[temp].Name == team_object[+toss].bowl_name[current_bowler])
                            {
                                data.match.commentary[data.match.commentary.length - 1] += ' & bowled ';
                            }
                            else
                            {
                                data.match.commentary[data.match.commentary.length - 1] += data.team[+toss].ratings[temp].Name;
                            }
                            ++catches[temp]; // unused elsewhere
                        }
                    }
                    else
                    {
                        data.match.commentary[data.match.commentary.length - 1] += ' runout';
                    }
                    if(balls[strike[+strike_index]])
                    {
                        control[strike[+strike_index]] *= (balls[strike[+strike_index]] - 1) / (balls[strike[+strike_index]]);
                    }
                    temp = 0;
                    for(k = 0; k < 6; ++k)
                    {
                        temp += balls_faced[+strike_index][k] * team_object[+toss].bowler_rating[k];
                    }
                    temp /= balls[strike[+strike_index]];
                    temp -= team_object[+!toss].bat_rating[strike[+strike_index]];
                    temp = score[strike[+strike_index]] * (1 - Math.exp(-(Math.pow(fours[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])) + Math.pow(maximums[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]]))) / (balls[strike[+strike_index]] + team_object[+!toss].bat_rating[strike[+strike_index]] + temp )));
                    if(points < temp)
                    {
                        MoM.team = +!toss;
                        points = Math.round(temp);
                        MoM.id = strike[+strike_index];
                    }
                    data.match.commentary[data.match.commentary.length - 1] += ' ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ' balls' + ' ' + fours[strike[+strike_index]] + 'X4\'s ' + maximums[strike[+strike_index]] + 'X6\'s) SR: ' + (score[strike[+strike_index]] * 100 / balls[strike[+strike_index]]).toFixed(2) + 'Control: ' + control[strike[+strike_index]] * 100 + ' Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ')' + ', Runrate: ' + (partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]).toFixed(2);
                    frustration[+strike_index] = 0;
                    ++current_partnership_index;
                    balls_faced[+strike_index] = [0, 0, 0, 0, 0, 0];
                    control[strike[+strike_index]] = 0;
                    strike[+strike_index] = (strike[+strike_index] > strike[+!strike_index] ? strike[+strike_index] : strike[+!strike_index]) + 1;
                    if (temp != -1 && rand() % 2)
                    {
                        strike_index = !strike_index;
                        data.match.commentary.push(' The two batsmen crossed over while the catch was being taken.');
                    }
                    if (wickets[0]++ == 9)
                    {
                        Overs[0] = 6 * i + j;
                        data.match.commentary.push(' And that wraps up the innings. ');
                        ++data.team[+!toss].all_outs;
                        break;
                    }
                    batsman_performance_index = i;
                    if (j == 6)
                    {
                        temp = 0;
                        ++batsman_performance_index;
                    }
                    fall_of_wicket = Total[0] + ' / ' + wickets[0] + ', ' + batsman_performance_index + '.' + temp;
                }
                else
                {
                    delivery_score = parseInt(batsman_performance_index);
                    if (delivery_score < 0)
                    {
                        delivery_score = 0;
                    }
                    continuous_wickets[current_bowler] = 0;
                    if (delivery_score > 6)
                    {
                        if (rand() % 2)
                        {
                            data.match.commentary.push(' wide, ' + wide[rand() % wide.length]);
                        }
                        else
                        {
                            data.match.commentary.push(freehit[rand() % freehit.length]);
                            free_hit = 1;
                        }
                        --j;
                        ++extras;
                        ++Total[0];
                        delivery_score = 0;
                        --deliveries[current_bowler];
                        --balls[strike[+strike_index]];
                        --balls_faced[+strike_index][current_bowler];
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
                                data.match.commentary.push('No run, ' + zero[rand() % zero.length]);
                                frustration[strike_index] += 1 - team_object[+!toss].bat_rating[strike[strike_index]] / 1000;
                                control[strike[+strike_index]] *= (balls[strike[+strike_index]] - 1) / (balls[strike[+strike_index]]);
                                ++dot_deliveries[current_bowler];
                                ++dot;
                                break;
                            case 5:
                                delivery_score -= 1;
                            case 4:
                                data.match.commentary.push('FOUR, ' + four[rand() % four.length]);
                                ++fours[strike[+strike_index]];
                                break;
                            case 6:
                                data.match.commentary.push('SIX, ' + six[rand() % six.length]);
                                ++maximums[strike[+strike_index]];
                                ++continuous_maximums;
                                break;
                            case 1:
                                data.match.commentary.push('1 run, ' + one[rand() % one.length]);
                                break;
                            case 2:
                                data.match.commentary.push('2 runs, ' + two[rand() % two.length]);
                                break;
                            case 3:
                                data.match.commentary.push('3 runs, ' + three[rand() % three.length]);
                                break;
                            default:
                                break;
                        }
                        if(delivery_score)
                        {
                            frustration[strike_index] -= Math.pow(2, delivery_score) / (1000 - team_object[+!toss].bat_rating[strike[strike_index]]);
                            control[strike[+strike_index]] = (control[strike[+strike_index]] * (balls[strike[+strike_index]] - 1) + 1)/ balls[strike[+strike_index]];
                        }
                        if (delivery_score != 6)
                        {
                            continuous_maximums = 0;
                        }
                        previous_over += delivery_score;
                        score[strike[+strike_index]] += delivery_score;
                        Total[0] += delivery_score;
                        partnership_runs[current_partnership_index] += delivery_score;
                    }
                    if (!milestone[strike[+strike_index]] && score[strike[+strike_index]] >= 50)
                    {
                        ++milestone[strike[+strike_index]];
                        data.match.commentary.push(' And that brings up his half century - a well timed innings indeed.');
                    }
                    else if (milestone[strike[+strike_index]] == 1 && score[strike[+strike_index]] >= 100)
                    {
                        ++milestone[strike[+strike_index]];
                        data.match.commentary.push(' What a wonderful way to bring up his century.');
                    }
                    if (delivery_score % 2)
                    {
                        strike_index = !strike_index;
                    }
                }
            }
            if (continuous_maximums == 6)
            {
                data.match.commentary.push(' Six G.P.L maximums in the previous over ! What an effort by ' + team_object[+!toss].bat_name[strike[+strike_index]] + '. The crowd is ecstatic, ' + team_object[+toss].bowl_name[current_bowler] + ' is absolutely flabbergasted. ');
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
                    data.match.commentary[data.match.commentary.length - 1] = ' maiden';
                }
                maidens[current_bowler] += 1;
            }
            data.match.commentary.push('  Current score: ' + Total[0] + ' / ' + wickets[0] + '  Runrate: ' + (Total[0] / (i + 1)).toFixed(2));
            if (strike[+strike_index] < 11)
            {
                data.match.commentary.push(' ' + team_object[+!toss].bat_name[strike[+strike_index]] + ' : ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ') ' + ', Control: ' + control[strike[+strike_index]] * 100 + ' %');
            }
            if (strike[+!strike_index] < 11)
            {
                data.match.commentary.push(' ' + team_object[+!toss].bat_name[strike[+!strike_index]] + ' : ' + score[strike[+!strike_index]] + ' (' + balls[strike[+!strike_index]] + '), Control: ' + control[strike[+!strike_index]] * 100 + ' %, Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + '), runrate: ' + (partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]).toFixed(2));
            }
            if (previous_batsman > -1)
            {
                data.match.commentary.push(' Previous Wicket: ' + team_object[+!toss].bat_name[previous_batsman] + ': ' + score[previous_batsman] + '(' + balls[previous_batsman] + '), Control: ' + control[previous_batsman] * 100 + '%');
                if (previous_dismissal > -1)
                {
                    data.match.commentary.push(', Dismissed by: ' + team_object[+toss].bowl_name[previous_dismissal]);
                }
                else
                {
                    data.match.commentary[data.match.commentary.length - 1] += '(runout)';
                }
                data.match.commentary.push(' Partnership: ' + partnership_runs[previous_partnership_index] + '(' + partnership_balls[previous_partnership_index] + '), runrate: ' + (partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index]).toFixed(2) + ' Fall of wicket: ' + fall_of_wicket);
            }
            data.match.commentary.push('  ' + team_object[+toss].bowl_name[current_bowler] + ': ' + deliveries[current_bowler] / 6 + '.' + deliveries[current_bowler] % 6 + '-' + maidens[current_bowler] + '-' + wickets_taken[current_bowler] + '-' + (runs_conceded[current_bowler] * 6 / deliveries[current_bowler]).toFixed(2) + '  ');
            if (deliveries[current_bowler] == 24)
            {
                data.match.commentary.push('And that brings an end to Bowler ' + team_object[+toss].bowl_name[current_bowler] + '\'s spell.  ');
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
                if (deliveries[j] <= 18 && team_object[+!toss].bowler_rating[j] > team_object[+!toss].bowler_rating[current_bowler] && j != previous_bowler)
                {
                    current_bowler = j;
                }
            }
            previous_bowler = current_bowler;
        }
        j = 0;
        for(i in data.team[+!toss].squad)
        {
            if(data.team[+!toss].squad[i] > 303)
            {
                continue;
            }
            ++data.team[+!toss].stats[data.team[+!toss].squad[i]].matches;
            data.team[+!toss].stats[data.team[+!toss].squad[i]].catches += catches[i];
            if((data.team[+!toss].squad[i] > 0 && data.team[+!toss].squad[i] < 114) || (data.team[+!toss].squad[i] > 242 && data.team[+!toss].squad[i] < 304))
            {
                data.team[+!toss].stats[data.team[+!toss].squad[i]].recent.push(score[j]);
                data.team[+!toss].stats[data.team[+!toss].squad[i]].runs_scored += score[j];
                data.team[+!toss].stats[data.team[+!toss].squad[i]].balls += balls[j];
                if(dismissed[j])
                {
                    ++data.team[+!toss].stats[data.team[+!toss].squad[i]].outs;
                }
                else if((j == strike[+strike_index]) || (j == strike[+!strike_index]))
                {
                    ++data.team[+!toss].stats[data.team[+!toss].squad[i]].notouts;
                }
                data.team[+!toss].stats[data.team[+!toss].squad[i]].strike_rate = data.team[+!toss].stats[data.team[+!toss].squad[i]].runs_scored * 100 / data.team[+!toss].stats[data.team[+!toss].squad[i]].balls;
                data.team[+!toss].stats[data.team[+!toss].squad[i]].average = data.team[+!toss].stats[data.team[+!toss].squad[i]].runs_scored / data.team[+!toss].stats[data.team[+!toss].squad[i]].outs;
                if(data.team[+!toss].stats[data.team[+!toss].squad[i]].high < score[j])
                {
                    data.team[+!toss].stats[data.team[+!toss].squad[i]].high = score[j];
                }
                else if(data.team[+!toss].stats[data.team[+!toss].squad[i]].low > score[j])
                {
                    data.team[+!toss].stats[data.team[+!toss].squad[i]].low = score[j];
                }
                data.team[+!toss].stats[data.team[+!toss].squad[i]].fours += fours[j];
                data.team[+!toss].stats[data.team[+!toss].squad[i]].sixes += maximums[j++];
            }
        }
        j = 0;
        for(i in data.team[+toss].squad)
        {
            if(data.team[+toss].squad[i] > 113 && data.team[+toss].squad[i] < 243)
            {
                data.team[+toss].stats[data.team[+toss].squad[i]].runs_given += runs_conceded[j];
                data.team[+toss].stats[data.team[+toss].squad[i]].wickets_taken += wickets_taken[j];
                data.team[+toss].stats[data.team[+toss].squad[i]].overs += deliveries[j++];
                data.team[+toss].stats[data.team[+toss].squad[i]].economy = data.team[+toss].stats[data.team[+toss].squad[i]].runs_given * 6 / data.team[+toss].stats[data.team[+toss].squad[i]].overs;
                data.team[+toss].stats[data.team[+toss].squad[i]].avg = data.team[+toss].stats[data.team[+toss].squad[i]].runs_given / data.team[+toss].stats[data.team[+toss].squad[i]].wickets_taken;
                data.team[+toss].stats[data.team[+toss].squad[i]].sr = data.team[+toss].stats[data.team[+toss].squad[i]].overs / data.team[+toss].stats[data.team[+toss].squad[i]].wickets_taken;
            }
        }
        strike = [0, 1];
        data.match.scorecard.push(' Scorecard: ');
        data.match.scorecard.push('Runs Balls Strike Rate Fours Sixes Dot balls Control');
        temp = 0;
        for (i = 0; i < 11; ++i)
        {
            if (!balls[i] && !dismissed[i])
            {
                data.match.scorecard.push(team_object[+!toss].bat_name[i] + '  DNB ');
            }
            else
            {
                data.match.scorecard.push(team_object[+!toss].bat_name[i] + ' ' + score[i] + ' ' + balls[i] + ' ' + (score[i] * 100 / balls[i]).toFixed(2) + ' ' + fours[i] + ' ' + maximums[i] + ' ' + dot_balls[i] +' ' + control[i] * 100);
                if (!dismissed[i])
                {
                    data.match.scorecard[data.match.scorecard.length - 1] += '  (not out)';
                }
            }
            if (i < 10)
            {
                partnership_runs[i] = partnership_balls[i] = 0;
            }
            temp += 4 * fours[i] + 6 * maximums[i];
            balls[i] = fours[i] = maximums[i] = dismissed[i] = milestone[i] = score[i] = balls[i] = fours[i] = maximums[i] = control[i] = catches[i] = dot_balls[i] = 0;
        }
        data.match.scorecard.push('Total: ' + Total[0] + ' / ' + wickets[0] + ' (' + parseInt(Overs[0] / 6) + '.' + Overs[0] % 6 + ' overs)  Runrate: ' + (Total[0] * 6 / Overs[0]).toFixed(2) + ' Extras: ' + extras);
        data.match.scorecard.push(' Runs scored in boundaries: ' + temp + ' of ' + Total[0] + ' (' + (temp * 100 / Total[0]).toFixed(2) + ' %) ');
        data.match.scorecard.push(' Bowling Statistics:');
        data.match.scorecard.push(' Bowling Statistics:');
        data.match.scorecard.push('  Bowler Overs Maidens Wickets Runs conceded Economy  ');
        for (i = 0; i < 6; i++)
        {
            temp = 0;
            for(k = 0; k < 11; ++k)
            {
                temp = deliveries_bowled[i][k] * team_object[+!toss].bat_rating[k];
            }
            temp /= deliveries[i];
            temp -= team_object[+toss].bowler_rating[i];
            temp = (wickets[i] * 20) * (1 - Math.exp(-Math.pow((dot_deliveries[i] + 1) * 6 , wickets_taken[i]) / (team_object[+toss].bowler_rating[i] + deliveries[i] + runs_conceded[i] + temp)));
            if(points < temp)
            {
                MoM.team = +toss;
                points = Math.round(temp);
                MoM.id = team_object[+toss].bowl_index[i];
            }
            data.match.scorecard.push(team_object[+toss].bowl_name[i] + ' ' + parseInt(deliveries[i] / 6) + '.' + deliveries[i] % 6 + ' ' + maidens[i] + ' ' + wickets_taken[i] + ' ' + runs_conceded[i] + ' ' + (runs_conceded[i] * 6 / deliveries[i]).toFixed(2));
            five_wicket_haul[i] = continuous_wickets[i] = deliveries[i] = maidens[i] = runs_conceded[i] = wickets_taken[i] = dot_deliveries[i] = 0;
            deliveries_bowled[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        data.match.scorecard.push('Fall of wickets: ');
        data.match.scorecard.push(wicket_sequence); // use typeof(a[]=='object') to format for commentary display section')
        data.match.scorecard.push('Dot ball percentage: ' + (dot * 100 / Overs[0]).toFixed(2) + ' %');
        extras = strike_index = free_hit = current_partnership_index = dot = previous_bowler = 0;
        balls_faced = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
        previous_batsman = previous_partnership_index = -1;
        data.match.scorecard.push('   ');
        wicket_sequence = [];
        frustration = [0, 0];
        data.match.commentary.push(mid[rand() % mid.length]);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        var hope = true;
        desperation[0] = +(data.team[+toss].streak < 0) * (1 - team_object[+toss].bat_rating[strike[0]] / 1000) * data.team[+toss].streak * ((Total[0] + 1) / 5000) * mean_rating[+!toss] / team_object[+toss].bat_strike_rate[strike[0]];
        desperation[1] = +(data.team[+toss].streak < 0) * (1 - team_object[+toss].bat_rating[strike[1]] / 1000) * data.team[+toss].streak * ((Total[0] + 1) / 5000) * mean_rating[+!toss] / team_object[+toss].bat_strike_rate[strike[1]];
        for (i = 1; i < 6; i++)
        {
            if (team_object[+!toss].bowler_rating[i] > team_object[+!toss].bowler_rating[previous_bowler])
            {
                previous_bowler = i;
            }
        }
        current_bowler = previous_bowler;
        data.match.commentary.push('  ' + team_object[+!toss].bowl_name[previous_bowler] + ' to start proceedings from the pavillion end.....  ');
        for (i = 0; i < 20 && (wickets[1] < 10 && Total[1] <= Total[0]); ++i)
        {
            previous_over = continuous_maximums = 0;
            if (deliveries[current_bowler] == 18)
            {
                data.match.commentary.push(' So the captain has chosen to bowl ' + team_object[+!toss].bowl_name[current_bowler] + ' out. ');
            }
            if ((score[strike[+strike_index]] >= 44 && score[strike[+strike_index]] < 50))
            {
                data.match.commentary.push('  ' + team_object[+toss].bat_name[strike[+strike_index]] + ' one hit away from a well deserving fifty. Will he make it ?  ');
            }
            else if ((score[strike[+strike_index]] >= 94 && score[strike[+strike_index]] < 100))
            {
                data.match.commentary.push('  ' + team_object[+toss].bat_name[strike[+strike_index]] + ' knows there is a hundred for the taking if he can knuckle this one down....  ');
            }
            for (j = 1; j <= 6; ++j)
            {
                delivery_score = team_object[+toss].bat_rating[strike[+strike_index]] - team_object[+!toss].bowler_rating[current_bowler];
                bowler_performance_index = (team_object[+!toss].bowler_rating[current_bowler]) / ((rand() % (team_object[+!toss].bowl_average[strike[+strike_index]] * team_object[+!toss].bowler_rating[current_bowler] / bowl[0] + 1) + team_object[+!toss].bowl_average[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+!toss].bowl_strike_rate[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / bowl[1] + 1) + team_object[+!toss].bowl_strike_rate[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+!toss].economy[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / bowl[2] + 1) + team_object[+!toss].economy[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000));
                batsman_performance_index = (rand() % (team_object[+toss].bat_average[strike[+strike_index]] * team_object[+toss].bat_rating[strike[+strike_index]] / bat[0] + 1) + team_object[+toss].bat_average[strike[+strike_index]] * (1000 - team_object[+toss].bat_rating[strike[+strike_index]]) / 1000) * (rand() % (team_object[+toss].bat_strike_rate[strike[+strike_index]] * team_object[+toss].bat_rating[strike[+strike_index]] / bat[1] + 1) + team_object[+toss].bat_strike_rate[strike[+strike_index]] * (1000 - team_object[+toss].bat_rating[strike[+strike_index]]) / 1000) / team_object[+!toss].bowler_rating[current_bowler] + Math.pow(-1, (rand() % 2)) * ((frustration[strike_index] >= 3) ? frustration[strike_index] : 0);
                if (!delivery_score)
                {
                    delivery_score = 1;
                }
                delivery_score += 1;
                if (batsman_performance_index > bowler_performance_index)
                {
                    batsman_performance_index += (rand() % delivery_score) / 100;
                }
                else
                {
                    batsman_performance_index -= (rand() % delivery_score) / 100;
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
                    data.match.commentary.push(i + '.' + j + ' ' + team_object[+!toss].bowl_name[current_bowler] + ' to ' + team_object[+toss].bat_name[strike[+strike_index]] + ', ');
                }
                if (batsman_performance_index <= 0 && !free_hit)
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
                    if (batsman_performance_index <= 0 && batsman_performance_index > -0.5)
                    {
                        data.match.commentary.push(caught[rand() % caught.length]);
                        temp = parseInt(Math.abs(batsman_performance_index * 22));
                    }
                    else if (batsman_performance_index <= -0.5 && batsman_performance_index > -1)
                    {
                        data.match.commentary.push(bowled[rand() % bowled.length]);
                    }
                    else if (batsman_performance_index <= -1 && batsman_performance_index > -1.5)
                    {
                        data.match.commentary.push(lbw[rand() % lbw.length]);
                    }
                    else if (batsman_performance_index <= -1.5 && batsman_performance_index > -2)
                    {
                        data.match.commentary.push(stumped[rand() % stumped.length]);
                    }
                    else
                    {
                        delivery_score = rand() % 3;
                        if (delivery_score)
                        {
                            data.match.commentary.push('  ' + delivery_score + '   run(s), ');
                            partnership_runs[current_partnership_index] += delivery_score;
                            score[strike[+strike_index]] += delivery_score;
                            previous_over += delivery_score;
                            Total[1] += delivery_score;
                            --dot_deliveries[current_bowler];
                        }
                        if (rand() % 2)
                        {
                            strike_index = !strike_index;
                        }
                        data.match.commentary.push(runout[rand() % runout.length]);
                        previous_dismissal = -1;
                        continuous_wickets[current_bowler] = 0;
                        --wickets_taken[current_bowler];
                        if (Total[1] > Total[0])
                        {
                            data.match.commentary.push(' What an emphatic victory ! ');
                            break;
                        }
                        else if (Total[1] == Total[0])
                        {
                            data.match.commentary.push('Scores are level...');
                        }
                    }
                    wicket_sequence.push(Total[1] + ' / ' + wickets[1] + ' ' + team_object[+toss].bat_name[strike[+strike_index]] + ' ' + team_object[+!toss].bowl_name[current_bowler] + ' Overs: ' + i + ' . ' + j);
                    if (balls[strike[+strike_index]] == 1)
                    {
                        data.match.commentary[data.match.commentary.length - 1] += ' first ball ';
                    }
                    if (!score[strike[+strike_index]])
                    {
                        data.match.commentary[data.match.commentary.length - 1] += 'for a duck !';
                    }
                    if (wickets_taken[current_bowler] == 5 && !five_wicket_haul[current_bowler])
                    {
                        five_wicket_haul[current_bowler] = 1;
                        data.match.commentary.push(', that brings up his five wicket haul, yet another tick in a list of accomplishments.');
                    }
                    if (score[strike[+strike_index]] >= 45 && score[strike[+strike_index]] < 50)
                    {
                        data.match.commentary.push(' looks like there won\'t be any fifty for ' + team_object[+toss].bat_name[strike[+strike_index]] + ', he came so close, and was yet so far. ');
                    }
                    else if (score[strike[+strike_index]] >= 90 && score[strike[+strike_index]] < 100) data.match.commentary.push(' He\'ll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team. ');
                    if (continuous_wickets[current_bowler] == 3)
                    {
                        data.match.commentary.push(' And that is also a hattrick for ' + team_object[+!toss].bowl_name[current_bowler] + '! Fantastic bowling in the time of need.');
                        continuous_wickets[current_bowler] = 0;
                    }
                    data.match.commentary.push('  ' + team_object[+toss].bat_name[strike[+strike_index]]);
                    if (previous_dismissal > -1)
                    {
                        data.match.commentary[data.match.commentary.length - 1] += ', ' + team_object[+!toss].bowl_name[current_bowler];
                        if(temp > -1)
                        {
                            data.match.commentary[data.match.commentary.length - 1] += ' caught ';
                            if(data.team[+toss].ratings[temp].Name == team_object[+toss].bowl_name[current_bowler])
                            {
                                data.match.commentary[data.match.commentary.length - 1] += ' & bowled ';
                            }
                            else
                            {
                                data.match.commentary[data.match.commentary.length - 1] += data.team[+toss].ratings[temp].Name;
                            }
                            ++catches[temp]; // unused elsewhere
                        }
                    }
                    else
                    {
                        data.match.commentary[data.match.commentary.length - 1] += ' runout';
                    }
                    if(balls[strike[+strike_index]])
                    {
                        control[strike[+strike_index]] *= ((balls[strike[+strike_index]] - 1)/ (balls[strike[+strike_index]])).toFixed(2);
                    }
                    temp = 0;
                    for(k = 0; k < 6; ++k)
                    {
                        temp += balls_faced[+strike_index][k] * team_object[+!toss].bowler_rating[k];
                    }
                    temp /= balls[strike[+strike_index]];
                    temp -= team_object[+toss].bat_rating[strike[+strike_index]];
                    temp = score[strike[+strike_index]] * (1 - Math.exp(-(Math.pow(fours[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]])) + Math.pow(maximums[strike[+strike_index]], 1 / (1 - control[strike[+strike_index]]))) / (balls[strike[+strike_index]] + team_object[+toss].bat_rating[strike[+strike_index]] + temp)));
                    if(points < temp)
                    {
                        MoM.team = +toss;
                        points = Math.round(temp);
                        MoM.id = strike[+strike_index];
                    }
                    data.match.commentary.push(' ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ' balls' + ' ' + fours[strike[+strike_index]] + 'X4\'s ' + maximums[strike[+strike_index]] + 'X6\'s) SR: ' + (score[strike[+strike_index]] * 100 / balls[strike[+strike_index]]).toFixed(2) + 'Control: ' + control[strike[+strike_index]] * 100  + '%, Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ')' + ', Runrate: ' + (partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index])).toFixed(2);
                    ++current_partnership_index;
                    strike[+strike_index] = (strike[+strike_index] > strike[+!strike_index] ? strike[+strike_index] : strike[+!strike_index]) + 1;
                    desperation[+strike_index] = +(data.team[+toss].streak < 0) * (1 - team_object[+toss].bat_rating[strike[+strike_index]] / 1000) * data.team[+toss].streak * ((Total[0] - Total[1] + 1) / 5000) * mean_rating[+!toss] / team_object[+toss].bat_strike_rate[strike[+strike_index]];
                    frustration[+strike_index] = 0;
                    control[strike[+strike_index]] = 0;
                    balls_faced[+strike_index] = [0, 0, 0, 0, 0, 0];
                    if (temp != -1 && rand() % 2)
                    {
                        strike_index = !strike_index;
                        data.match.commentary.push(' The two batsmen crossed over while the catch was being taken.');
                    }
                    if (wickets[1]++ == 9)
                    {
                        Overs[1] = 6 * i + j;
                        data.match.commentary.push(' And that wraps up the innings. ');
                        ++data.team[+toss].all_outs;
                        break;
                    }
                    batsman_performance_index = i;
                    if (j == 6)
                    {
                        temp = 0;
                        ++batsman_performance_index;

                    }
                    fall_of_wicket = Total[1] + ' / ' + wickets[1] + ', ' + batsman_performance_index + '.' + temp;
                }
                else
                {
                    delivery_score = parseInt(batsman_performance_index);
                    if (delivery_score < 0)
                    {
                        delivery_score = 0;
                    }
                    continuous_wickets[current_bowler] = 0;
                    if (delivery_score > 6)
                    {
                        if (rand() % 2)
                        {
                            data.match.commentary.push(' wide, ' + wide[rand() % wide.length]);
                        }
                        else
                        {
                            data.match.commentary.push(freehit[rand() % freehit.length]);
                            free_hit = 1;
                        }
                        --j;
                        ++extras;
                        ++Total[1];
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
                                data.match.commentary.push('No run, ' + zero[rand() % zero.length]);
                                frustration[strike_index] += 1 - team_object[+toss].bat_rating[strike[strike_index]] / 1000;
                                control[strike[+strike_index]] *= ((balls[strike[+strike_index]] - 1) / (balls[strike[+strike_index]])).toFixed(2);
                                ++dot_deliveries[current_bowler];
                                ++dot;
                                break;
                            case 5:
                                delivery_score -= 1;
                            case 4:
                                data.match.commentary.push('FOUR, ' + four[rand() % four.length]);
                                ++fours[strike[+strike_index]];
                                break;
                            case 6:
                                data.match.commentary.push('SIX, ' + six[rand() % six.length]);
                                ++maximums[strike[+strike_index]];
                                ++continuous_maximums;
                                break;
                            case 1:
                                data.match.commentary.push('1 run, ' + one[rand() % one.length]);
                                break;
                            case 2:
                                data.match.commentary.push('2 runs, ' + two[rand() % two.length]);
                                break;
                            case 3:
                                data.match.commentary.push('3 runs, ' + three[rand() % three.length]);
                                break;
                            default:
                                break;
                        }
                        if(delivery_score)
                        {
                            frustration[strike_index] -= Math.pow(2, delivery_score) / (1000 - team_object[+toss].bat_rating[strike[strike_index]]);
                            control[strike[+strike_index]] = ((control[strike[+strike_index]] * (balls[strike[+strike_index]] - 1) + 1) / (balls[strike[+strike_index]])).toFixed(2);
                        }
                        if (delivery_score != 6)
                        {
                            continuous_maximums = 0;
                        }
                        previous_over += delivery_score;
                        score[strike[+strike_index]] += delivery_score;
                        Total[1] += delivery_score;
                        partnership_runs[current_partnership_index] += delivery_score;

                    }
                    if (Total[1] == Total[0])
                    {
                        data.match.commentary.push(' Scores are level now... ');
                    }
                    else if (Total[1] > Total[0])
                    {
                        data.match.commentary.push(' And they have done it! What an emphatic victory ! ');
                        Overs[1] = 6 * i + j;
                        break;
                    }
                    if (!milestone[strike[+strike_index]] && score[strike[+strike_index]] >= 50)
                    {
                        ++milestone[strike[+strike_index]];
                        data.match.commentary.push(' And that brings up his half century - a well timed innings indeed.');
                    }
                    else if (milestone[strike[+strike_index]] == 1 && score[strike[+strike_index]] >= 100)
                    {
                        ++milestone[strike[+strike_index]];
                        data.match.commentary.push(' what a wonderful way to bring up his century.');
                    }
                    if (delivery_score % 2)
                    {
                        strike_index = !strike_index;
                    }
                }
            }
            if (continuous_maximums == 6)
            {
                data.match.commentary.push(' Six G.P.L maximums in the previous over ! What an effort by ' + team_object[+toss].bat_name[strike[+strike_index]] + '. The crowd is ecstatic, ' + team_object[+!toss].bowl_name[current_bowler] + ' is absolutely flabbergasted. ');
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
            data.match.commentary.push('  Current score: ' + Total[1] + ' / ' + wickets[1] + '  Runrate: ' + (Total[1] / (i + 1)).toFixed(2));
            if (Total[1] > Total[0])
            {
                break;
            }
            data.match.commentary.push(', RRR: ' + parseFloat(((Total[0] + 1 - Total[1]) / (19 - i))).toFixed(2) + '  Equation: ' + data.team[+toss]._id + ' needs ' + (Total[0] + 1 - Total[1]) + ' runs from ' + parseInt(114 - 6 * i) + ' balls with ' + (10 - wickets[1]) + ' wickets remaining');
            if (strike[+strike_index] < 11)
            {
                data.match.commentary.push(' ' + team_object[+toss].bat_name[strike[+strike_index]] + ' : ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + '), Control: ' + control[strike[+strike_index]] * 100 + '%');
            }
            if (strike[+!strike_index] < 11)
            {
                data.match.commentary.push(' ' + team_object[+toss].bat_name[strike[+!strike_index]] + ' : ' + score[strike[+!strike_index]] + ' (' + balls[strike[+!strike_index]] + '), Control: ' + control[strike[+!strike_index]] * 100 +  ' %, Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + '), runrate: ' + (partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index])).toFixed(2);
            }
            if (previous_batsman > -1)
            {
                data.match.commentary.push(' Previous Wicket: ' + team_object[+toss].bat_name[previous_batsman] + ': ' + score[previous_batsman] + '(' + balls[previous_batsman] + ')' + 'Control: ' + control[previous_batsman] * 100);
                if (previous_dismissal > -1)
                {
                    data.match.commentary.push(', Dismissed by: ' + team_object[+!toss].bowl_name[previous_dismissal]);
                }
                else
                {
                    data.match.commentary[data.match.commentary.length - 1] += '(runout)';
                }
                data.match.commentary.push(' Partnership: ' + partnership_runs[previous_partnership_index] + '(' + partnership_balls[previous_partnership_index] + '), runrate: ' + (partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index]).toFixed(2) + ' Fall of wicket: ' + fall_of_wicket);
            }
            data.match.commentary.push('  ' + team_object[+!toss].bowl_name[current_bowler] + ': ' + parseInt(deliveries[current_bowler] / 6) + '.' + deliveries[current_bowler] % 6 + '-' + maidens[current_bowler] + '-' + wickets_taken[current_bowler] + '-' + runs_conceded[current_bowler] + '-' + (runs_conceded[current_bowler] * 6 / deliveries[current_bowler]).toFixed(2) + '  ');
            if (i < 19 && ((Total[0] + 1 - Total[1]) / (19 - i) > 36) && hope)
            {
                data.match.commentary.push(data.team[+toss]._id + ' might as well hop onto the team bus now.... ');
                hope = false;
            }
            if (deliveries[current_bowler] == 24)
            {
                data.match.commentary.push('And that brings an end to Bowler ' + team_object[+!toss].bowl_name[current_bowler] + '\'s spell.  ');
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
                if (deliveries[j] <= 18 && team_object[+!toss].bowler_rating[j] > team_object[+!toss].bowler_rating[current_bowler] && j != previous_bowler)
                {
                    current_bowler = j;
                }
            }
            previous_bowler = current_bowler;
        }
        data.match.commentary.push(end[rand() % end.length]);
        j = 0;
        for(i in data.team[+toss].squad)
        {
            if(data.team[+toss].squad[i] > 303)
            {
                continue;
            }
            ++data.team[+toss].stats[data.team[+toss].squad[i]].matches;
            data.team[+toss].stats[data.team[+toss].squad[i]].catches += catches[i];
            if((data.team[+toss].squad[i] > 0 && data.team[+toss].squad[i] < 114) || (data.team[+toss].squad[i] > 242 && data.team[+toss].squad[i] < 304))
            {
                data.team[+toss].stats[data.team[+toss].squad[i]].recent.push(score[j]);
                data.team[+toss].stats[data.team[+toss].squad[i]].runs_scored += score[j];
                data.team[+toss].stats[data.team[+toss].squad[i]].balls += balls[j];
                if(dismissed[j])
                {
                    ++data.team[+toss].stats[data.team[+toss].squad[i]].outs;
                }
                else if((j == strike[+strike_index]) || (j == strike[+!strike_index]))
                {
                    ++data.team[+toss].stats[data.team[+toss].squad[i]].notouts;
                }
                data.team[+toss].stats[data.team[+toss].squad[i]].strike_rate = data.team[+toss].stats[data.team[+toss].squad[i]].runs_scored * 100 / data.team[+toss].stats[data.team[+toss].squad[i]].balls;
                data.team[+toss].stats[data.team[+toss].squad[i]].average = data.team[+toss].stats[data.team[+toss].squad[i]].runs_scored / data.team[+toss].stats[data.team[+toss].squad[i]].outs;
                if(data.team[+toss].stats[data.team[+toss].squad[i]].high < score[j])
                {
                    data.team[+toss].stats[data.team[+toss].squad[i]].high = score[j];
                }
                else if(data.team[+toss].stats[data.team[+toss].squad[i]].low > score[j])
                {
                    data.team[+toss].stats[data.team[+toss].squad[i]].low = score[j];
                }
                data.team[+toss].stats[data.team[+toss].squad[i]].fours += fours[j];
                data.team[+toss].stats[data.team[+toss].squad[i]].sixes += maximums[j++];
            }
        }
        j = 0;
        for(i in data.team[+!toss].squad)
        {
            if(data.team[+!toss].squad[i] > 113 && data.team[+!toss].squad[i] < 243)
            {
                data.team[+!toss].stats[data.team[+!toss].squad[i]].runs_given += runs_conceded[j];
                data.team[+!toss].stats[data.team[+!toss].squad[i]].wickets_taken += wickets_taken[j];
                data.team[+!toss].stats[data.team[+!toss].squad[i]].overs += deliveries[j++];
                data.team[+!toss].stats[data.team[+!toss].squad[i]].economy = data.team[+!toss].stats[data.team[+!toss].squad[i]].runs_given * 6 / data.team[+!toss].stats[data.team[+!toss].squad[i]].overs;
                data.team[+!toss].stats[data.team[+!toss].squad[i]].avg = data.team[+!toss].stats[data.team[+!toss].squad[i]].runs_given / data.team[+!toss].stats[data.team[+!toss].squad[i]].wickets_taken;
                data.team[+!toss].stats[data.team[+!toss].squad[i]].sr = data.team[+!toss].stats[data.team[+!toss].squad[i]].overs / data.team[+!toss].stats[data.team[+!toss].squad[i]].wickets_taken;
            }
        }
        data.match.scorecard.push(' Scorecard:');
        data.match.scorecard.push('Runs   Balls Strike Rate Fours Sixes Dot balls Control');
        temp = 0;
        for (i = 0; i < 11; ++i)
        {
            if (!balls[i] && !dismissed[i])
            {
                data.match.scorecard.push(team_object[+toss].bat_name[i] + ' DNB ');
            }
            else
            {
                data.match.scorecard.push(team_object[+toss].bat_name[i] + ' ' + score[i] + ' ' + balls[i] + ' ' + (score[i] * 100 / balls[i]).toFixed(2) + ' ' + fours[i] + ' ' + maximums[i] + ' ' + dot_balls[i] + ' ' + control[i] * 100);
                if (!dismissed[i])
                {
                    data.match.scorecard[data.match.scorecard.length - 1] += '  (not out)';
                }
            }
            if (i < 10)
            {
                partnership_runs[i] = partnership_balls[i] = 0;
            }
            temp += fours[i] * 4 + maximums[i] * 6;
            balls[i] = fours[i] = maximums[i] = dismissed[i] = milestone[i] = score[i] = balls[i] = fours[i] = maximums[i] = control[i] = 0;
        }
        data.match.scorecard.push('Total: ' + Total[1] + ' / ' + wickets[1] + ' (' + parseInt(Overs[1] / 6) + '.' + Overs[1] % 6 + ' overs)  Runrate: ' + (Total[1] * 6 / Overs[1]).toFixed(2) + ' Extras: ' + extras);
        data.match.scorecard.push(' Runs scored in boundaries: ' + temp + ' of ' + Total[1] + ' (' + (temp * 100 / Total[1]).toFixed(2) + ' %) ');
        data.match.scorecard.push(' Bowling Statistics:  ');
        data.match.scorecard.push('Bowler Overs Maidens Wickets Runs conceded Economy  ');
        for (i = 0; i < 6; i++)
        {
            temp = 0;
            for(k = 0; k < 11; ++k)
            {
                temp += deliveries_bowled[i][k] * team_object[+toss].bat_rating[k];
            }
            temp /= deliveries[i];
            temp -= team_object[+!toss].bowler_rating[i];
            temp = (wickets[i] * 20) * (1 - Math.exp(-Math.pow((dot_deliveries[i] + 1) * 6 , wickets_taken[i]) / (team_object[+!toss].bowler_rating[i] + deliveries[i] + runs_conceded[i] + temp)));
            if(points < temp)
            {
                MoM.team = +!toss;
                points = Math.round(temp);
                MoM.id = team_object[+!toss].bowl_index[i];
            }
            data.match.scorecard.push(team_object[+!toss].bowl_name[i] + ' ' + parseInt(deliveries[i] / 6) + '.' + deliveries[i] % 6 + ' ' + maidens[i] + ' ' + wickets_taken[i] + ' ' + runs_conceded[i] + ' ' + (runs_conceded[i] * 6 / deliveries[i]).toFixed(2));
            five_wicket_haul[i] = continuous_wickets[i] = deliveries[i] = maidens[i] = runs_conceded[i] = wickets_taken[i] = 0;
        }
        data.match.scorecard.push('Fall of wickets: ');
        data.match.scorecard.push(wicket_sequence); // use (typeof(a[])=='object') for commentary display section
        data.match.scorecard.push('Dot ball percentage: ' + (dot * 100 / Overs[1]).toFixed(2) + ' %');
        data.match.scorecard.push('   ');
        if (!(Total[0] - Total[1]))
        {
            if (!(wickets[0] - wickets[1]))
            {
                if (!(Overs[0] - Overs[1]))
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
                    winner_index = -1;
                    ++data.team[0].tied;
                    ++data.team[1].tied;
                    ++data.team[0].points;
                    ++data.team[1].points;
                    data.team[0].balls_for += Overs[0];
                    data.team[1].balls_for += Overs[1];
                    data.team[0].runs_for += Total[0];
                    data.team[1].runs_for += Total[1];
                    data.team[0].balls_against += Overs[1];
                    data.team[1].balls_against += Overs[0];
                    data.team[0].runs_against += Total[1];
                    data.team[1].runs_against += Total[0];
                    data.team[0].wickets_taken += wickets[0];
                    data.team[1].wickets_taken += wickets[1];
                    data.team[0].wickets_fallen += wickets[0];
                    data.team[1].wickets_fallen += wickets[1];
                    data.team[0].form += Overs[0] * (mean_rating[1] - mean_rating[0]) / Total[0] / 6;
                    data.team[1].form += Overs[0] * (mean_rating[0] - mean_rating[1]) / Total[0] / 6;
                    data.team[0].net_run_rate = (((data.team[0].runs_for) / (data.team[0].balls_for) - (data.team[0].runs_against) / (data.team[0].balls_against)) * 6).toFixed(2);
                    data.team[1].net_run_rate = (((data.team[1].runs_for) / (data.team[1].balls_for) - (data.team[1].runs_against) / (data.team[1].balls_against)) * 6).toFixed(2);
                }
                else
                {
                    winner = +(Overs[1] < Overs[0]);
                    winner_index = (Overs[0] > Overs[1]) ? (+toss) : (+!toss);
                    data.match.commentary[data.match.commentary.length - 1] += data.team[+winner_index]._id + ' wins! (higher run rate)  ';
                }
            }
            else
            {
                winner = +(wickets[1] < wickets[0]);
                winner_index = (wickets[0] > wickets[1]) ? (+toss) : (+!toss);
                data.match.commentary[data.match.commentary.length - 1] += data.team[+winner_index]._id + ' wins! (fewer wickets lost)  ';
            }
        }
        else
        {
            winner_index = (Total[1] > Total[0]) ? (+toss) : (+!toss);
            winner = +(Total[1] > Total[0]);
            if (Total[0] < Total[1])
            {
                data.match.commentary.push(data.team[+toss]._id + ' wins by ');
                data.match.commentary[data.match.commentary.length - 1] += (10 - wickets[1]) + ' wicket(s) !';
            }
            else
            {
                data.match.commentary.push(data.team[+!toss]._id + ' wins by ');
                data.match.commentary[data.match.commentary.length - 1] += (Total[0] - Total[1]) + ' runs!';
            }
            data.match.commentary[data.match.commentary.length - 1] += ' ';
        }
        if (parseInt(winner_index) != -1)
        {
            console.log(data.team[+winner_index]._id + ' wins against ' + data.team[+!winner_index]._id);
            if(data.team[+winner_index].highest_total < Total[+winner])
            {
                data.team[+winner_index].highest_total = Total[+winner];
            }
            if(data.team[+winner_index].lowest_total > Total[+winner])
            {
                data.team[+winner_index].lowest_total = Total[+winner];
            }
            if(data.team[+!winner_index].highest_total < Total[+!winner])
            {
                data.team[+!winner_index].highest_total = Total[+!winner];
            }
            if(data.team[+!winner_index].lowest_total > Total[+!winner])
            {
                data.team[+!winner_index].lowest_total = Total[+!winner];
            }
            ++data.team[+winner_index].win;
            ++data.team[+!winner_index].loss;
            data.team[+winner_index].points += 2;
            data.team[+winner_index].balls_for += Overs[+winner];
            data.team[+!winner_index].balls_for += Overs[+!winner];
            data.team[+winner_index].runs_for += Total[+winner];
            data.team[+!winner_index].runs_for += Total[+!winner];
            data.team[+winner_index].balls_against += Overs[+!winner];
            data.team[+!winner_index].balls_against += Overs[+winner];
            data.team[+winner_index].runs_against += Total[+!winner];
            data.team[+!winner_index].runs_against += Total[+winner];
            data.team[+winner_index].wickets_taken += wickets[+!winner];
            data.team[+!winner_index].wickets_taken += wickets[+winner];
            data.team[+winner_index].wickets_lost += wickets[+winner];
            data.team[+!winner_index].wickets_lost += wickets[+!winner];
            data.team[+winner].streak = (data.team[+winner].streak < 0) ? (1) : (data.team[+winner].streak + 1);
            data.team[+!winner].streak = (data.team[+!winner].streak > 0) ? (0) : (data.team[+!winner].streak - 1);
            data.team[+winner].ratio = data.team[+winner].win / (data.team[+winner].loss ? data.team[+winner].loss : 1 );
            data.team[+!winner].ratio = data.team[+!winner].win / (data.team[+!winner].loss ? data.team[+!winner].loss : 1);
            data.team[+winner_index].form += ((Overs[+winner] * mean_rating[+!winner] / Total[+winner]) - (Overs[+!winner] * mean_rating[+winner] / Total[+!winner])) / 6;
            data.team[+!winner_index].form += ((Overs[+!winner] * mean_rating[+winner] / Total[+!winner]) - (Overs[+winner] * mean_rating[+!winner] / Total[+winner]))/ 6;
            data.team[+winner].net_run_rate = (((data.team[+winner].runs_for) / (data.team[+winner].balls_for) - (data.team[+winner].runs_against) / (data.team[+winner].balls_against)) * 6).toFixed(2);
            data.team[+!winner].net_run_rate = (((data.team[+!winner].runs_for) / (data.team[+!winner].balls_for) - (data.team[+!winner].runs_against) / (data.team[+!winner].balls_against)) * 6).toFixed(2);
        }
        ++data.team[MoM.team].stats[MoM.id].MoM;
        data.match.commentary.push('Man of the Match: ' + data.team[MoM.team].ratings[MoM.id].Name);
        temp = (data.team[MoM.team].ratings[MoM.id].Type == 'bat') ? (mom.bat) : ((data.team[MoM.team].ratings[MoM.id].Type == 'bowl') ? (mom.bowl) : (mom.all));
        data.match.commentary.push(temp[rand() % temp.length]);
        data.match.commentary.push(end[rand() % end.length]);
    }
    ++data.team[0].played;
    ++data.team[1].played;
    data.team[0].squad.pop();
    data.team[1].squad.pop();
    delete data.team[0].ratings;
    delete data.team[1].ratings;
    data.team[0].avg_runs_for = data.team[0].runs_for / data.team[0].played;
    data.team[1].avg_runs_for = data.team[1].runs_for / data.team[1].played;
    data.team[0].avg_runs_against = data.team[0].runs_against / data.team[0].played;
    data.team[1].avg_runs_against = data.team[1].runs_against / data.team[1].played;
    data.team[0].avg_wickets_taken = data.team[0].wickets_taken / data.team[0].played;
    data.team[1].avg_wickets_taken = data.team[1].wickets_taken / data.team[1].played;
    data.team[0].avg_wickets_lost = data.team[0].wickets_fallen / data.team[0].played;
    data.team[1].avg_wickets_lost = data.team[1].wickets_fallen / data.team[1].played;
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