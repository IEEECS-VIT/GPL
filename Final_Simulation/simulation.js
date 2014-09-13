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
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';
var path = require('path');
var db;

var com = require(path.join(__dirname, 'commentary'));
var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}
var today = new Date();
var dateMatchDay;
var dot;
var users = [];
var collectionName;
var delivery_score;
var batsman_performance_index;
var current_bowler = -1;
var bowler_performance_index;
var previous_bowler = -1;
var toss;
var i;
var j;
var strike_index = 0;
var continuous_maximums;
var fall_of_wicket;
var winner_index;
var commentary = [];
var dismissed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var five_wicket_haul = [0, 0, 0, 0, 0, 0];
var free_hit = 0;
var previous_partnership_index = -1;
var current_partnership_index = 0;
var partnership_balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var partnership_runs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var continuous_wickets = [0, 0, 0, 0, 0, 0];
var milestone = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var previous_dismissal = -1;
var extras = 0;
var maidens = [0, 0, 0, 0, 0, 0];
var previous_batsman = -1;
var score = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var fours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var maximums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var strike = [0, 1];
var deliveries = [0, 0, 0, 0, 0, 0];
var runs_conceded = [0, 0, 0, 0, 0, 0];
var wickets_taken = [0, 0, 0, 0, 0, 0];
var Total = [0, 0];
var previous_over = 0;
var wickets = [0, 0];
var Overs = [0, 0];
var bowl = [1200, 1200, 1200]; // increase to strengthen bowling
var bat = [1100, 1100];    // decrease to strengthen batting

exports.todaysMatches = function (callback)
{
    var onConnect = function (err, database)
    {
        db = database;
        if (err)
        {
            throw err;
        }
        else
        {

            var day = today.getDate();
            switch (day)
            {
                case 0:
                    collectionName = 'matchday4';
                    break;
                case 1:
                    collectionName = 'matchday5';
                    break;
                case 2:
                    collectionName = 'matchday6';
                    break;
                case 3:
                    collectionName = 'matchday7';
                    break;
                case 4:
                    collectionName = 'matchday1';
                    break;
                case 5:
                    collectionName = 'matchday2';
                    break;
                case 6:
                    collectionName = 'matchday3';
                    break;
                default :
                    break;

            }
            collectionName = 'matchday1';

            var collection = db.collection(collectionName);
            collection.find().toArray(function (err, docs)
                                        {
                                            db.close();
                                            callback(err, docs);
                                        });
        }

    };
    var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 }, auto_reconnect: true,
        poolSize: 20 },
        replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } } };
    require('mongodb').MongoClient.connect(mongoUri, options, onConnect);


};

function rand()
{
    return parseInt(Math.random() * 1000000000000000);
}

team_object = [];

exports.team = function (elt, team1, team2, user1, user2, callback)
{
    team_object[0] = new Make(team1);
    team_object[1] = new Make(team2);
    users.push(user1);
    users.push(user2);
    start_match(elt, callback);
};

function Make(team)
{
    var i;
    Overs[0] = Overs[1] = 0;
    this.bat_rating = [];
    this.bat_average = [];
    this.bat_strike_rate = [];
    this.bowler_rating = [];
    this.bowl_average = [];
    this.bowl_strike_rate = [];
    this.coach_rating = parseInt(team[11]['Rating (15)']);
    console.log(this.coach_rating);
    this.economy = [];
    this.bowl_name = [];
    this.bat_name = [];
    var average_bat_rating = 0, average_bowl_rating = 0;
    var batsman_count = 0, bowler_count = 0;
    for (i = 0; i < 11; ++i)
    {
        switch (team[i].Type)
        {
            case 'bat':
                this.bat_average[batsman_count] = parseFloat(team[i]['Average']);
                this.bat_strike_rate[batsman_count] = parseFloat(team[i]['Strike Rate']);
                this.bat_rating[batsman_count] = parseInt(team[i]['Rating (900)']);
                this.bat_name[batsman_count] = team[i]['Name'];
                average_bat_rating = average_bat_rating + parseInt(team[i]['Rating (900)']);
                batsman_count++;
                break;
            case 'bowl':
                this.bowl_average[bowler_count] = parseFloat(team[i]['Avg']);
                this.bowl_strike_rate[bowler_count] = parseFloat(team[i]['SR']);
                this.bowler_rating[bowler_count] = parseInt(team[i]['Rating (900)']);
                this.bat_average[batsman_count] = parseFloat(team[i]['Average']);
                this.bat_strike_rate[batsman_count] = parseFloat(team[i]['Strike Rate']);
                this.bat_rating[batsman_count] = 900 - parseInt(team[i]['Rating (900)']);
                this.economy[bowler_count] = parseFloat(team[i]['Economy']);
                this.bowl_name[bowler_count] = this.bat_name[batsman_count] = team[i]['Name'];
                average_bowl_rating = average_bowl_rating + parseInt(team[i]['Rating (900)']);
                bowler_count++;
                batsman_count++;
                break;
            case 'all':
                this.bowl_average[bowler_count] = parseFloat(team[i]['Avg']);
                this.bowl_strike_rate[bowler_count] = parseFloat(team[i]['SR']);
                this.bowler_rating[bowler_count] = parseInt(team[i]['Bowl']);
                this.bat_average[batsman_count] = parseFloat(team[i]['Average']);
                this.bat_strike_rate[batsman_count] = parseFloat(team[i]['Strike Rate']);
                this.bat_rating[batsman_count] = parseInt(team[i]['Bat']);
                this.economy[bowler_count] = parseFloat(team[i]['Economy']);
                this.bowl_name[bowler_count] = team[i]['Name'];
                this.bat_name[batsman_count] = team[i]['Name'];
                average_bat_rating += parseInt(team[i]['Bat']);
                average_bowl_rating += parseInt(team[i]['Bowl']);
                batsman_count++;
                bowler_count++;
                break;
        }

    }
    average_bat_rating = parseFloat(average_bat_rating / 11);
    average_bowl_rating = parseFloat(average_bowl_rating / 6);

    for (i = 0; i < 11; ++i)
    {
        if (i < 6)
        {
            this.bowler_rating[i] += parseFloat(this.bowler_rating[i] / 5) - parseFloat(average_bowl_rating / 5) + parseInt(this.coach_rating);
        }
        this.bat_rating[i] += parseFloat(this.bat_rating[i] / 10) - parseFloat(average_bat_rating / 10) + parseInt(this.coach_rating);
    }
}

function start_match(elt, callback)
{
    var dot = 0;
    Total[0] = Total[1] = 0;
    Overs[0] = Overs[1] = 120;
    elt.commentary = [];
    //console.log(" ", "Team ");
    if (rand() % 2)
    {
        //console.log(2);
        toss = 1;
    }
    else
    {
        //console.log(1);
        toss = 0;
    }
    elt.commentary.push(' ' + users[+toss]._id + ' wins the toss and chooses to ');
    if (rand() % 2)
    {
        elt.commentary[elt.commentary.length - 1] += 'bowl ';

    }//console.log(" wins the toss and chooses to bowl first");
    else
    {
        toss = !toss;
        elt.commentary[elt.commentary.length - 1] += 'bat ';//console.log(" wins the toss and chooses to bat first");
    }
    elt.commentary[elt.commentary.length - 1] += 'first  ';
    /*if (+toss)
     {
     var temp = users[0];
     var temp2 = users[1];
     users[1] = temp;
     users[0] = temp2;
     }*/
    wickets[0] = wickets[1] = strike_index = previous_bowler = 0;
    for (i = 1; i < 6; ++i)
    {
        if (team_object[+toss].bowler_rating[i] > team_object[+toss].bowler_rating[previous_bowler])
        {
            previous_bowler = i;
        }
    }
    current_bowler = previous_bowler;
    elt.commentary.push(team_object[+toss].bowl_name[previous_bowler] + ' to start proceedings from the pavillion end.....  '); //console.log(" Bowler ", previous_bowler + 1, " to start proceedings from the pavillion end.....  ");
    dot = 0;
    for (i = 0; i < 20 && wickets[0] < 10; ++i)
    {
        previous_over = continuous_maximums = 0;
        if (deliveries[current_bowler] == 18)
        {
            elt.commentary.push('So the captain has chosen to bowl ' + team_object[+toss].bowl_name[current_bowler] + ' out. ');
        }//console.log("So the captain has chosen to bowl Bowler ", current_bowler + 1, " out. ");
        if ((score[strike[+strike_index]] >= 44 && score[strike[+strike_index]] < 50))
        {
            elt.commentary.push(team_object[+!toss].bat_name[strike[+strike_index]] + ' one hit away from a well deserving fifty. Will he make it ?  ');
        }//console.log("Batsman ", strike[+strike_index] + 1, " one hit away from a well deserving fifty. Will he make it ?  ");
        else if ((score[strike[+strike_index]] >= 94 && score[strike[+strike_index]] < 100))
        {
            elt.commentary.push(team_object[+!toss].bat_name[strike[+strike_index]] + ' knows there is a hundred for the taking if he can knuckle this one down....  ');
        }//console.log("Batsman ", strike[+strike_index] + 1, " knows there is a hundred for the taking if he can knuckle this one down....  ");
        for (j = 1; j <= 6; ++j)
        {
            delivery_score = Math.abs(team_object[+!toss].bat_rating[strike[+strike_index]] - team_object[+toss].bowler_rating[current_bowler]);
            bowler_performance_index = (team_object[+toss].bowler_rating[current_bowler]) / ((rand() % (team_object[+toss].bowl_average[strike[+strike_index]] * team_object[+toss].bowler_rating[current_bowler] / bowl[0] + 1) + team_object[+toss].bowl_average[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+toss].bowl_strike_rate[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / bowl[1] + 1) + team_object[+toss].bowl_strike_rate[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+toss].economy[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / bowl[2] + 1) + team_object[+toss].economy[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000));
            batsman_performance_index = (rand() % (team_object[+!toss].bat_average[strike[+strike_index]] * team_object[+!toss].bat_rating[strike[+strike_index]] / bat[0] + 1) + team_object[+!toss].bat_average[strike[+strike_index]] * (1000 - team_object[+!toss].bat_rating[strike[+strike_index]]) / 1000) * (rand() % (team_object[+!toss].bat_strike_rate[strike[+strike_index]] * team_object[+!toss].bat_rating[strike[+strike_index]] / bat[1] + 1) + team_object[+!toss].bat_strike_rate[strike[+strike_index]] * (1000 - team_object[+!toss].bat_rating[strike[+strike_index]]) / 1000) / team_object[+toss].bowler_rating[current_bowler];
            if (!delivery_score) delivery_score = 1;
            delivery_score += 1;
            if (batsman_performance_index > bowler_performance_index)
            {
                batsman_performance_index += (rand() % delivery_score) / 100;
            }
            else
            {
                batsman_performance_index -= (rand() % delivery_score) / 100;
            }
            ++balls[strike[+strike_index]];
            ++deliveries[current_bowler];
            ++partnership_balls[current_partnership_index];
            if (free_hit)
            {
                elt.commentary.push(' Free Hit: ');
            }//console.log(" Free Hit: ");
            else
            {
                elt.commentary.push(i + '.' + j + ' ' + team_object[+toss].bowl_name[current_bowler] + ' to ' + team_object[+!toss].bat_name[strike[+strike_index]] + ', ');
            }//console.log(i + "." + j, " Bowler ", current_bowler + 1, " to Batsman ", strike[+strike_index] + 1, ", ");
            if (batsman_performance_index <= 0 && !free_hit)
            {
                previous_batsman = strike[+strike_index];
                dismissed[strike[+strike_index]] = 1;
                elt.commentary.push('OUT ');//console.log("OUT ");
                previous_dismissal = current_bowler;
                ++continuous_wickets[current_bowler];
                previous_partnership_index = current_partnership_index;
                ++wickets_taken[current_bowler];
                if (batsman_performance_index <= 0 && batsman_performance_index > -0.5)
                {
                    elt.commentary.push(com.caught[rand() % com.caught.length]);
                    /*console.log("(caught)"); console.log(com.caught[rand()%com.caught.length]);*/
                }
                else if (batsman_performance_index <= -0.5 && batsman_performance_index > -1)
                {
                    elt.commentary.push(com.bowled[rand() % com.bowled.length]);
                    /*console.log("(bowled)"); console.log(com.bowled[rand()%com.bowled.length]);*/
                }
                else if (batsman_performance_index <= -1 && batsman_performance_index > -1.5)
                {
                    elt.commentary.push(com.lbw[rand() % com.lbw.length]);
                    /*console.log("(LBW)"); console.log(com.lbw[rand()%com.lbw.length]);*/
                }
                else if (batsman_performance_index <= -1.5 && batsman_performance_index > -2)
                {
                    elt.commentary.push(com.stumped[rand() % com.stumped.length]);
                    /*console.log("(stumped)"); console.log(com.stumped[rand()%com.stumped.length]);*/
                }
                else
                {
                    delivery_score = rand() % 3;
                    if (delivery_score)
                    {
                        elt.commentary.push('  ' + delivery_score + ' run(s), ');//console.log("  ", delivery_score, "   run(s), ");
                        partnership_runs[current_partnership_index] += delivery_score;
                        score[strike[+strike_index]] += delivery_score;
                        previous_over += delivery_score;
                        Total[0] += delivery_score;

                    }
                    if (rand() % 2)
                    {
                        strike_index = !strike_index;
                    }
                    elt.commentary.push(com.runout[rand() % com.runout.length]);//console.log(com.runout[rand()%com.runout.length]);
                    previous_dismissal = -1;
                    continuous_wickets[current_bowler] = 0;
                    --wickets_taken[current_bowler];
                }
                if (balls[strike[+strike_index]] == 1)elt.commentary[elt.commentary.length - 1] += ' first ball ';//console.log(" first ball ");
                if (!score[strike[+strike_index]])elt.commentary[elt.commentary.length - 1] += ' for a duck ! ';//console.log("for a duck !");
                if (wickets_taken[current_bowler] == 5 && !five_wicket_haul[current_bowler])
                {
                    five_wicket_haul[current_bowler] = 1;
                    elt.commentary.push(', that brings up his five wicket haul, yet another tick in a list of accomplishments.'); //console.log(", that brings up his five wicket haul, yet another tick in a list of accomplishments.");
                }
                if (score[strike[+strike_index]] >= 45 && score[strike[+strike_index]] < 50)
                {
                    elt.commentary.push(' looks like there won\'t be any fifty for ' + team_object[+!toss].bat_name[strike[+strike_index]] + ', he came so close, and was yet so far. ');
                }//console.log(" looks like there won'strike_index be any fifty for Batsman ", strike[+strike_index], ", he came so close, and was yet so far. ");
                else if (score[strike[+strike_index]] >= 90 && score[strike[+strike_index]] < 100) elt.commentary.push(' He\'ll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team. ');//console.log(" He'll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team. ");
                if (continuous_wickets[current_bowler] == 3)
                {
                    elt.commentary.push(' And that is also a hattrick for bowler ' + team_object[+!toss].bowl_name[current_bowler] + '! Fantastic bowling in the time of need.');//console.log(" And that is also a hattrick for bowler ", current_bowler + 1, "! Fantastic bowling in the time of need.");
                    continuous_wickets[current_bowler] = 0;
                }
                elt.commentary.push('  ' + team_object[+!toss].bat_name[strike[+strike_index]]);//console.log(" Batsman ", strike[+strike_index] + 1);
                if (previous_dismissal > -1)
                {
                    elt.commentary.push(', ' + team_object[+toss].bowl_name[current_bowler]);
                }//console.log(", Bowler ", current_bowler + 1);
                else
                {
                    elt.commentary[elt.commentary.length - 1] += ' runout';
                }//console.log(" runout");
                elt.commentary[elt.commentary.length - 1] += ' ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ' balls' + ' ' + fours[strike[+strike_index]] + 'X4\'s ' + maximums[strike[+strike_index]] + 'X6\'s) SR: ' + (score[strike[+strike_index]] * 100 / balls[strike[+strike_index]]).toFixed(2) + ' Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ')' + ', Runrate: ' + (partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]).toFixed(2);//console.log(" ", score[strike[+strike_index]], " (", balls[strike[+strike_index]], " balls", " ", fours[strike[+strike_index]], "X4'score ", maximums[strike[+strike_index]], "X6'score) SR: ", score[strike[+strike_index]] * 100 / balls[strike[+strike_index]], " Partnership: ", partnership_runs[current_partnership_index], "(", partnership_balls[current_partnership_index], ")", ", Runrate: ", partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]);
                ++current_partnership_index;
                strike[+strike_index] = (strike[+strike_index] > strike[+!strike_index] ? strike[+strike_index] : strike[+!strike_index]) + 1;
                if (batsman_performance_index <= -0 && batsman_performance_index >= -0.5 && rand() % 2)
                {
                    strike_index = !strike_index;
                    elt.commentary.push(' The two batsmen crossed over while the catch was being taken.');//console.log(" The two batsmen crossed over while the catch was being taken.");
                }
                if (wickets[0]++ == 9)
                {
                    Overs[0] = 6 * i + j;
                    elt.commentary.push(' And that wraps up the innings. ');//console.log(" And that wraps up the innings. ");
                    break;
                }
                batsman_performance_index = i;
                if (j == 6)
                {
                    j = 0;
                    ++batsman_performance_index;
                }
                fall_of_wicket = Total[0] + ' / ' + wickets[0] + ', ' + batsman_performance_index + '.' + j;
            }
            else
            {
                delivery_score = parseInt(batsman_performance_index);
                if (delivery_score < 0) delivery_score = 0;
                continuous_wickets[current_bowler] = 0;
                if (delivery_score > 6)
                {
                    if (rand() % 2)
                    {
                        elt.commentary.push(' wide, ' + com.wide[rand() % com.wide.length]);//console.log(" wide, ");
                    }
                    else
                    {
                        elt.commentary.push(com.freehit[rand() % com.freehit.length]);//console.log("No ball. An overstep was the last thing the bowling side needed... ");
                        free_hit = 1;
                    }
                    --j;
                    ++extras;
                    --partnership_balls[current_partnership_index];
                    ++partnership_runs[current_partnership_index];
                    --balls[strike[+strike_index]];
                    --deliveries[current_bowler];
                    ++Total[0];
                    delivery_score = 0;
                }
                else
                {
                    if (free_hit) free_hit = 0;
                    switch (delivery_score)
                    {
                        case 0:
                            elt.commentary.push('No run, ' + com.dot[rand() % com.dot.length]);//console.log(" No run");
                            //console.log(com.dot[rand()%com.dot.length]);
                            ++dot;
                            break;
                        case 5:
                            delivery_score -= 1;
                        case 4:
                            elt.commentary.push('FOUR, ' + com.four[rand() % com.four.length]);//console.log("FOUR");
                            //console.log(com.four[rand()%com.four.length]);
                            ++fours[strike[+strike_index]];
                            break;
                        case 6:
                            elt.commentary.push('SIX, ' + com.six[rand() % com.six.length]);//console.log("SIX");
                            //console.log(com.six[rand()%com.six.length]);
                            ++maximums[strike[+strike_index]];
                            ++continuous_maximums;
                            break;
                        case 1:
                            elt.commentary.push('1 run, ' + com.one[rand() % com.one.length]);
                            break;
                        case 2:
                            elt.commentary.push('2 runs, ' + com.two[rand() % com.two.length]);
                            break;
                        case 3:
                            elt.commentary.push('3 runs, ' + com.three[rand() % com.three.length]);
                            break;
                        default:
                            break;
                    }
                    if (delivery_score != 6) continuous_maximums = 0;
                    previous_over += delivery_score;
                    score[strike[+strike_index]] += delivery_score;
                    Total[0] += delivery_score;
                    partnership_runs[current_partnership_index] += delivery_score;

                }
                if (!milestone[strike[+strike_index]] && score[strike[+strike_index]] >= 50)
                {
                    ++milestone[strike[+strike_index]];
                    elt.commentary.push(' And that brings up his half century - a well timed innings indeed.');//console.log(" And that brings up his half century - a well timed innings indeed.");
                }
                else if (milestone[strike[+strike_index]] == 1 && score[strike[+strike_index]] >= 100)
                {
                    ++milestone[strike[+strike_index]];
                    elt.commentary.push(' What a wonderful way to bring up his century.');//console.log(" what a wonderful way to bring up his century.");
                }
                if (delivery_score % 2) strike_index = !strike_index;
            }
        }
        if (continuous_maximums == 6) elt.commentary.push(' Six G.P.L maximums in the previous over ! What an effort by ' + team_object[+!toss].bat_name[strike[+strike_index]] + '. The crowd is ecstatic, ' + team_object[+toss].bowl_name[current_bowler] + ' is absolutely flabbergasted. ');//console.log(" Six G.P.L maximums in the previous over ! What an effort by Batsman.", strike[+strike_index], ". The crowd is ecstatic, Bowler ", current_bowler, " is absolutely flabbergasted. ");
        runs_conceded[current_bowler] += previous_over;
        strike_index = !strike_index;
        elt.commentary.push(' Last over: ');//console.log(" Last over: ");
        if (previous_over)
        {
            elt.commentary[elt.commentary.length - 1] += previous_over + ' run(s)';
        }//console.log(previous_over, "   run(s)");
        else
        {
            if (j == 7)elt.commentary[elt.commentary.length - 1] = ' maiden';//console.log("maiden");
            maidens[current_bowler] += 1;
        }
        elt.commentary.push('  Current score: ' + Total[0] + ' / ' + wickets[0] + '  Runrate: ' + (Total[0] / (i + 1)).toFixed(2));//console.log("  Current score: ", Total[0], " / ", wickets[0], "  Runrate: ", Total[0] / (i + 1));
        if (strike[+strike_index] < 11) elt.commentary.push(' ' + team_object[+!toss].bat_name[strike[+strike_index]] + ' : ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ') ');//console.log("Batsman: ", strike[+strike_index] + 1, " : ", score[strike[+strike_index]], " (", balls[strike[+strike_index]], ") ");
        if (strike[+!strike_index] < 11) elt.commentary.push(' ' + team_object[+!toss].bat_name[strike[+!strike_index]] + ' : ' + score[strike[+!strike_index]] + ' (' + balls[strike[+!strike_index]] + ') Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ') runrate: ' + (partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index])).toFixed(2);//console.log("Batsman: ", strike[+!strike_index] + 1, " : ", score[strike[+!strike_index]], " (", balls[strike[+!strike_index]], ") Partnership: ", partnership_runs[current_partnership_index], "(", partnership_balls[current_partnership_index], "), runrate: ", partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]);
        if (previous_batsman > -1)
        {
            elt.commentary.push(' Previous Wicket: ' + team_object[+!toss].bat_name[previous_batsman] + ': ' + score[previous_batsman] + '(' + balls[previous_batsman] + ')');//console.log(" Previous Wicket: Batsman ", previous_batsman + 1, ": ", score[previous_batsman], "(", balls[previous_batsman], ")");
            if (previous_dismissal > -1)
            {
                elt.commentary.push(', Dismissed by: ' + team_object[+toss].bowl_name[previous_dismissal]);
            }//console.log(", Dismissed by: Bowler ", previous_dismissal + 1);
            else
            {
                elt.commentary[elt.commentary.length - 1] += '(runout)';
            }//console.log("(runout)");
            elt.commentary.push(' Partnership: ' + partnership_runs[previous_partnership_index] + '(' + partnership_balls[previous_partnership_index] + '), runrate: ' + (partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index]).toFixed(2) + ' Fall of wicket: ' + fall_of_wicket);//console.log(" Partnership: ", partnership_runs[previous_partnership_index], "(", partnership_balls[previous_partnership_index], "), runrate: ", partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index]);
            //console.log("Fall of wicket: ",fall_of_wicket);
        }
        elt.commentary.push('  ' + team_object[+toss].bowl_name[current_bowler] + ': ' + deliveries[current_bowler] / 6 + '.' + deliveries[current_bowler] % 6 + '-' + maidens[current_bowler] + '-' + wickets_taken[current_bowler] + '-' + (runs_conceded[current_bowler] * 6 / deliveries[current_bowler]).toFixed(2) + '  ');//console.log(" Bowler ", current_bowler + 1, ": ", deliveries[current_bowler] / 6 + "." + deliveries[current_bowler] % 6, "-", maidens[current_bowler], "-", wickets_taken[current_bowler], "-", runs_conceded[current_bowler] * 6 / deliveries[current_bowler], "  ");
        if (deliveries[current_bowler] == 24) elt.commentary.push('And that brings an end to Bowler ' + team_object[+toss].bowl_name[current_bowler] + '\'s spell.  ');//console.log("And that brings an end to Bowler ", current_bowler + 1, "'score spell.  ");
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
            if (deliveries[j] <= 18 && team_object[+!toss].bowler_rating[j] > team_object[+!toss].bowler_rating[current_bowler] && j != previous_bowler) current_bowler = j;
        }
        previous_bowler = current_bowler;
    }
    strike = [0, 1];
    elt.commentary.push(' Scorecard: ');
    elt.commentary.push('Runs Balls Strike Rate Fours Sixes');//console.log(" Scorecard:   Runs Balls Strike Rate Fours Sixes  ");
    for (i = 0; i < 11; ++i)
    {
        if (!balls[i])
        {
            elt.commentary.push(team_object[+!toss].bat_name[i] + '  DNB ');
        }//console.log("  DNB ");
        else
        {
            elt.commentary.push(team_object[+!toss].bat_name[i] + ' ' + score[i] + ' ' + balls[i] + ' ' + (score[i] * 100 / balls[i]).toFixed(2) + ' ' + fours[i] + ' ' + maximums[i]);//console.log(score[i], balls[i], score[i] * 100 / balls[i], fours[i], maximums[i]);
            if (!dismissed[i]) elt.commentary.push('  (not out)');//console.log("  (not out)");
        }
        if (i < 10)
        {
            partnership_runs[i] = partnership_balls[i] = 0;
        }
        balls[i] = fours[i] = maximums[i] = dismissed[i] = milestone[i] = score[i] = balls[i] = fours[i] = maximums[i] = 0;
    }
    elt.commentary.push('Total: ' + Total[0] + ' / ' + wickets[0] + ' (' + parseInt(Overs[0] / 6) + '.' + Overs[0] % 6 + ' overs)  Runrate: ' + (Total[0] * 6 / Overs[0]).toFixed(2) + ' Extras: ' + extras);
    elt.commentary.push(' Bowling Statistics:');
    elt.commentary.push('  Bowler Overs Maidens Wickets Runs conceded Economy  ');//console.log("Total[0]: ", Total[0], " / ", wickets[0], " (", parseInt(Overs[0] / 6) + "." + Overs[0] % 6, " overs)  Runrate: ", Total[0] * 6 / Overs[0], " Extras: ", extras, "  Bowling Statistics:  Bowler Overs Maidens Wickets Runs conceded Economy  ");
    for (i = 0; i < 6; i++)
    {
        elt.commentary.push(team_object[+toss].bowl_name[i] + ' ' + parseInt(deliveries[i] / 6) + '.' + deliveries[i] % 6 + ' ' + maidens[i] + ' ' + wickets_taken[i] + ' ' + runs_conceded[i] + ' ' + (runs_conceded[i] * 6 / deliveries[i]).toFixed(2));//console.log(i + 1, parseInt(deliveries[i] / 6) + "." + deliveries[i] % 6, maidens[i], wickets_taken[i], runs_conceded[i], runs_conceded[i] * 6 / deliveries[i]);
        five_wicket_haul[i] = continuous_wickets[i] = deliveries[i] = maidens[i] = runs_conceded[i] = wickets_taken[i] = 0;
    }
    elt.commentary.push('Dot ball percentage: ' + (dot * 100 / Overs[0]).toFixed(2) + ' %');//console.log("Dot ball percentage: ", dot * 100 / Overs[0], " %");
    extras = strike_index = free_hit = current_partnership_index = dot = previous_bowler = 0;
    previous_batsman = previous_partnership_index = -1;
    elt.commentary.push('   ');
//console.log(elt.commentary);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for (i = 1; i < 6; i++)
    {
        if (team_object[+!toss].bowler_rating[i] > team_object[+!toss].bowler_rating[previous_bowler])
        {
            previous_bowler = i;
        }
    }
    current_bowler = previous_bowler;
    elt.commentary.push('  ' + team_object[+!toss].bowl_name[previous_bowler] + ' to start proceedings from the pavillion end.....  ');//console.log(" Bowler ", previous_bowler + 1, " to start proceedings from the pavillion end.....  ");
    dot = 0;
    for (i = 0; i < 20 && (wickets[1] < 10 && Total[1] <= Total[0]); ++i)
    {
        previous_over = continuous_maximums = 0;
        if (deliveries[current_bowler] == 18)
        {
            elt.commentary.push(' So the captain has chosen to bowl ' + team_object[+!toss].bowl_name[current_bowler] + ' out. ');
        }//console.log("So the captain has chosen to bowl Bowler ", current_bowler + 1, " out. ");
        if ((score[strike[+strike_index]] >= 44 && score[strike[+strike_index]] < 50))
        {
            elt.commentary.push('  ' + team_object[+toss].bat_name[strike[+strike_index]] + ' one hit away from a well deserving fifty. Will he make it ?  ');
        }//console.log("Batsman ", strike[+strike_index] + 1, " one hit away from a well deserving fifty. Will he make it ?  ");
        else if ((score[strike[+strike_index]] >= 94 && score[strike[+strike_index]] < 100))
        {
            elt.commentary.push('  ' + team_object[+toss].bat_name[strike[+strike_index]] + ' knows there is a hundred for the taking if he can knuckle this one down....  ');
        }//console.log("Batsman ", strike[+strike_index] + 1, " knows there is a hundred for the taking if he can knuckle this one down....  ");
        for (j = 1; j <= 6; ++j)
        {
            delivery_score = Math.abs(team_object[+toss].bat_rating[strike[+strike_index]] - team_object[+!toss].bowler_rating[current_bowler]);
            bowler_performance_index = (team_object[+!toss].bowler_rating[current_bowler]) / ((rand() % (team_object[+!toss].bowl_average[strike[+strike_index]] * team_object[+!toss].bowler_rating[current_bowler] / bowl[0] + 1) + team_object[+!toss].bowl_average[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+!toss].bowl_strike_rate[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / bowl[1] + 1) + team_object[+!toss].bowl_strike_rate[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+!toss].economy[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / bowl[2] + 1) + team_object[+!toss].economy[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000));
            batsman_performance_index = (rand() % (team_object[+toss].bat_average[strike[+strike_index]] * team_object[+toss].bat_rating[strike[+strike_index]] / bat[0] + 1) + team_object[+toss].bat_average[strike[+strike_index]] * (1000 - team_object[+toss].bat_rating[strike[+strike_index]]) / 1000) * (rand() % (team_object[+toss].bat_strike_rate[strike[+strike_index]] * team_object[+toss].bat_rating[strike[+strike_index]] / bat[1] + 1) + team_object[+toss].bat_strike_rate[strike[+strike_index]] * (1000 - team_object[+toss].bat_rating[strike[+strike_index]]) / 1000) / team_object[+!toss].bowler_rating[current_bowler];
            if (!delivery_score) delivery_score = 1;
            delivery_score += 1;
            if (batsman_performance_index > bowler_performance_index)
            {
                batsman_performance_index += (rand() % delivery_score) / 100;
            }
            else
            {
                batsman_performance_index -= (rand() % delivery_score) / 100;
            }
            ++balls[strike[+strike_index]];
            ++deliveries[current_bowler];
            ++partnership_balls[current_partnership_index];
            if (free_hit)
            {
                elt.commentary.push(' Free Hit: ');
            }//console.log(" Free Hit: ");
            else
            {
                elt.commentary.push(i + '.' + j + ' ' + team_object[+!toss].bowl_name[current_bowler] + ' to ' + team_object[+toss].bat_name[strike[+strike_index]] + ', ');
            }//console.log(i + "." + j, " Bowler ", current_bowler + 1, " to Batsman ", strike[+strike_index] + 1, ", ");
            if (batsman_performance_index <= 0 && !free_hit)
            {
                previous_batsman = strike[+strike_index];
                dismissed[strike[+strike_index]] = 1;
                elt.commentary[elt.commentary.length - 1] += 'OUT ';//console.log("OUT ");
                previous_dismissal = current_bowler;
                ++continuous_wickets[current_bowler];
                previous_partnership_index = current_partnership_index;
                ++wickets_taken[current_bowler];
                if (batsman_performance_index <= 0 && batsman_performance_index > -0.5)
                {
                    elt.commentary.push(com.caught[rand() % com.caught.length]);
                    /*console.log("(caught)"); console.log(com.caught[rand()%com.caught.length]);*/
                }
                else if (batsman_performance_index <= -0.5 && batsman_performance_index > -1)
                {
                    elt.commentary.push(com.bowled[rand() % com.bowled.length]);
                    /*console.log("(bowled)"); console.log(com.bowled[rand()%com.bowled.length]);*/
                }
                else if (batsman_performance_index <= -1 && batsman_performance_index > -1.5)
                {
                    elt.commentary.push(com.lbw[rand() % com.lbw.length]);
                    /*console.log("(LBW)"); console.log(com.lbw[rand()%com.lbw.length]);*/
                }
                else if (batsman_performance_index <= -1.5 && batsman_performance_index > -2)
                {
                    elt.commentary.push(com.stumped[rand() % com.stumped.length]);
                    /*console.log("(stumped)"); console.log(com.stumped[rand()%com.stumped.length]);*/
                }
                else
                {
                    delivery_score = rand() % 3;
                    if (delivery_score)
                    {
                        elt.commentary.push('  ' + delivery_score + '   run(s), ');//console.log("  ", delivery_score, "   run(s), ");
                        partnership_runs[current_partnership_index] += delivery_score;
                        score[strike[+strike_index]] += delivery_score;
                        previous_over += delivery_score;
                        Total[1] += delivery_score;
                    }
                    if (rand() % 2)
                    {
                        strike_index = !strike_index;
                    }
                    elt.commentary.push(com.runout[rand() % com.runout.length]);//console.log(com.runout[rand()%com.runout.length]);
                    previous_dismissal = -1;
                    continuous_wickets[current_bowler] = 0;
                    --wickets_taken[current_bowler];
                    if (Total[1] > Total[0])
                    {
                        elt.commentary.push(' What an emphatic victory ! ');//console.log("What an emphatic victory ! ");
                        break;
                    }
                    else if (Total[1] == Total[0]) elt.commentary.push('Scores are level...');//console.log("Scores are level...");
                }
                if (balls[strike[+strike_index]] == 1)elt.commentary[elt.commentary.length - 1] += ' first ball ';//console.log(" first ball ");
                if (!score[strike[+strike_index]])elt.commentary[elt.commentary.length - 1] += 'for a duck !';//console.log("for a duck !");
                if (wickets_taken[current_bowler] == 5 && !five_wicket_haul[current_bowler])
                {
                    five_wicket_haul[current_bowler] = 1;
                    elt.commentary.push(', that brings up his five wicket haul, yet another tick in a list of accomplishments.');//console.log(", that brings up his five wicket haul, yet another tick in a list of accomplishments.");
                }
                if (score[strike[+strike_index]] >= 45 && score[strike[+strike_index]] < 50)
                {
                    elt.commentary.push(' looks like there won\'t be any fifty for ' + team_object[+toss].bat_name[strike[+strike_index]] + ', he came so close, and was yet so far. ');
                }//console.log(" looks like there won'strike_index be any fifty for Batsman ", strike[+strike_index], ", he came so close, and was yet so far. ");
                else if (score[strike[+strike_index]] >= 90 && score[strike[+strike_index]] < 100) elt.commentary.push(' He\'ll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team. ');//console.log(" He'll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team. ");
                if (continuous_wickets[current_bowler] == 3)
                {
                    elt.commentary.push(' And that is also a hattrick for ' + team_object[+!toss].bowl_name[current_bowler] + '! Fantastic bowling in the time of need.');//console.log(" And that is also a hattrick for bowler ", current_bowler + 1, "! Fantastic bowling in the time of need.");
                    continuous_wickets[current_bowler] = 0;
                }
                elt.commentary.push('  ' + team_object[+toss].bat_name[strike[+strike_index]]);//console.log(" Batsman ", strike[+strike_index] + 1);
                if (previous_dismissal > -1)
                {
                    elt.commentary[elt.commentary.length - 1] += ', ' + team_object[+!toss].bowl_name[current_bowler];
                }//console.log(", Bowler ", current_bowler + 1);
                else
                {
                    elt.commentary[elt.commentary.length - 1] += ' runout';
                }//console.log(" runout");
                elt.commentary.push(' ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ' balls' + ' ' + fours[strike[+strike_index]] + 'X4\'s ' + maximums[strike[+strike_index]] + 'X6\'s) SR: ' + (score[strike[+strike_index]] * 100 / balls[strike[+strike_index]]).toFixed(2) + ' Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ')' + ', Runrate: ' + (partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index])).toFixed(2);//console.log(" ", score[strike[+strike_index]], " (", balls[strike[+strike_index]], " balls", " ", fours[strike[+strike_index]], "X4'score ", maximums[strike[+strike_index]], "X6'score) SR: ", score[strike[+strike_index]] * 100 / balls[strike[+strike_index]], " Partnership: ", partnership_runs[current_partnership_index], "(", partnership_balls[current_partnership_index], ")", ", Runrate: ", partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]);
                ++current_partnership_index;
                strike[+strike_index] = (strike[+strike_index] > strike[+!strike_index] ? strike[+strike_index] : strike[+!strike_index]) + 1;
                if (batsman_performance_index <= -0 && batsman_performance_index >= -0.5 && rand() % 2)
                {
                    strike_index = !strike_index;
                    elt.commentary.push(' The two batsmen crossed over while the catch was being taken.');//console.log(" The two batsmen crossed over while the catch was being taken.");
                }
                if (wickets[1]++ == 9)
                {
                    Overs[1] = 6 * i + j;
                    elt.commentary.push(' And that wraps up the innings. ');//console.log(" And that wraps up the innings. ");
                    break;
                }
                batsman_performance_index = i;
                if (j == 6)
                {
                    j = 0;
                    ++batsman_performance_index;
                }
                fall_of_wicket = Total[1] + ' / ' + wickets[1] + ', ' + batsman_performance_index + '.' + j;
            }
            else
            {
                delivery_score = parseInt(batsman_performance_index);
                if (delivery_score < 0) delivery_score = 0;
                continuous_wickets[current_bowler] = 0;
                if (delivery_score > 6)
                {
                    if (rand() % 2)
                    {
                        elt.commentary.push(' wide, ' + com.wide[rand() % com.wide.length]);//console.log(" wide, ");
                    }
                    else
                    {
                        elt.commentary.push(com.freehit[rand() % com.freehit.length]);//console.log("No ball. An overstep was the last thing the bowling side needed... ");
                        free_hit = 1;
                    }
                    --j;
                    ++extras;
                    --partnership_balls[current_partnership_index];
                    ++partnership_runs[current_partnership_index];
                    --balls[strike[+strike_index]];
                    --deliveries[current_bowler];
                    ++Total[1];
                    delivery_score = 0;
                }
                else
                {
                    if (free_hit) free_hit = 0;
                    switch (delivery_score)
                    {
                        case 0:
                            elt.commentary.push('No run, ' + com.dot[rand() % com.dot.length]);//console.log(" No run");
                            //console.log(com.dot[rand()%com.dot.length]);
                            ++dot;
                            break;
                        case 5:
                            delivery_score -= 1;
                        case 4:
                            elt.commentary.push('FOUR, ' + com.four[rand() % com.four.length]);//console.log("FOUR");
                            //console.log(com.four[rand()%com.four.length]);
                            ++fours[strike[+strike_index]];
                            break;
                        case 6:
                            elt.commentary.push('SIX, ' + com.six[rand() % com.six.length]);//console.log("SIX");
                            //console.log(com.six[rand()%com.six.length]);
                            ++maximums[strike[+strike_index]];
                            ++continuous_maximums;
                            break;
                        case 1:
                            elt.commentary.push('1 run, ' + com.one[rand() % com.one.length]);
                            break;
                        case 2:
                            elt.commentary.push('2 runs, ' + com.two[rand() % com.two.length]);
                            break;
                        case 3:
                            elt.commentary.push('3 runs, ' + com.three[rand() % com.three.length]);
                            break;
                        default:
                            break;
                    }
                    if (delivery_score != 6) continuous_maximums = 0;
                    previous_over += delivery_score;
                    score[strike[+strike_index]] += delivery_score;
                    Total[1] += delivery_score;
                    partnership_runs[current_partnership_index] += delivery_score;

                }
                if (Total[1] == Total[0])
                {
                    elt.commentary.push(' Scores are level now... ');
                }//console.log(" Scores are level now... ");
                else if (Total[1] > Total[0])
                {
                    elt.commentary.push(' And they have done it! What an emphatic victory ! ');//console.log(" And they have done it! What an emphatic victory ! ");
                    Overs[1] = 6 * i + j;
                    break;
                }
                if (!milestone[strike[+strike_index]] && score[strike[+strike_index]] >= 50)
                {
                    ++milestone[strike[+strike_index]];
                    elt.commentary.push(' And that brings up his half century - a well timed innings indeed.');//console.log(" And that brings up his half century - a well timed innings indeed.");
                }
                else if (milestone[strike[+strike_index]] == 1 && score[strike[+strike_index]] >= 100)
                {
                    ++milestone[strike[+strike_index]];
                    elt.commentary.push(' what a wonderful way to bring up his century.');//console.log(" what a wonderful way to bring up his century.");
                }
                if (delivery_score % 2) strike_index = !strike_index;
            }
        }

        if (continuous_maximums == 6) elt.commentary.push(' Six G.P.L maximums in the previous over ! What an effort by ' + team_object[+toss].bat_name[strike[+strike_index]] + '. The crowd is ecstatic, ' + team_object[+!toss].bowl_name[current_bowler] + ' is absolutely flabbergasted. ');//console.log(" Six G.P.L maximums in the previous over ! What an effort by Batsman.", strike[+strike_index], ". The crowd is ecstatic, Bowler ", current_bowler, " is absolutely flabbergasted. ");
        runs_conceded[current_bowler] += previous_over;
        strike_index = !strike_index;
        elt.commentary.push(' Last Over: ');//console.log(" Last over: ");
        if (previous_over)
        {
            elt.commentary[elt.commentary.length - 1] += previous_over + " run(s)";
        }//console.log(previous_over, "   run(s)");
        else
        {
            if (j == 7)elt.commentary[elt.commentary.length - 1] += 'maiden';//console.log("maiden");
            maidens[current_bowler] += 1;
        }
        elt.commentary.push('  Current score: ' + Total[1] + ' / ' + wickets[1] + '  Runrate: ' + (Total[1] / (i + 1)).toFixed(2));//console.log("  Current score: ", Total[1], " / ", wickets[1], "  Runrate: ", Total[1] / (i + 1));
        if (Total[1] > Total[0]) break;
        elt.commentary.push(', RRR: ' + parseFloat(((Total[0] + 1 - Total[1]) / (19 - i))).toFixed(2) + '  Equation: ' + parseInt(Total[0] + 1 - Total[1]) + ' runs needed from ' + parseInt(114 - 6 * i) + ' balls. ');//console.log(", RRR: ", (Total[0] + 1 - Total[1]) / (19 - i), "  Equation: ", (Total[0] + 1 - Total[1]), " runs needed from ", 114 - 6 * i, " balls. ");
        if (strike[+strike_index] < 11) elt.commentary.push(' ' + team_object[+toss].bat_name[strike[+strike_index]] + ' : ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ') ');//console.log("Batsman: ", strike[+strike_index] + 1, " : ", score[strike[+strike_index]], " (", balls[strike[+strike_index]], ") ");
        if (strike[+!strike_index] < 11) elt.commentary.push(' ' + team_object[+toss].bat_name[strike[+!strike_index]] + ' : ' + score[strike[+!strike_index]] + ' (' + balls[strike[+!strike_index]] + ') Partnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + '), runrate: ' + (partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index])).toFixed(2);//console.log("Batsman: ", strike[+!strike_index] + 1, " : ", score[strike[+!strike_index]], " (", balls[strike[+!strike_index]], ") Partnership: ", partnership_runs[current_partnership_index], "(", partnership_balls[current_partnership_index], "), runrate: ", partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]);
        if (previous_batsman > -1)
        {
            elt.commentary.push(' Previous Wicket: ' + team_object[+toss].bat_name[previous_batsman] + ': ' + score[previous_batsman] + '(' + balls[previous_batsman] + ')');//console.log(" Previous Wicket: Batsman ", previous_batsman + 1, ": ", score[previous_batsman], "(", balls[previous_batsman], ")");
            if (previous_dismissal > -1)
            {
                elt.commentary.push(', Dismissed by: ' + team_object[+!toss].bowl_name[previous_dismissal]);
            }//console.log(", Dismissed by: Bowler ", previous_dismissal + 1);
            else
            {
                elt.commentary[elt.commentary.length - 1] += '(runout)';
            }//console.log("(runout)");
            elt.commentary.push(' Partnership: ' + partnership_runs[previous_partnership_index] + '(' + partnership_balls[previous_partnership_index] + '), runrate: ' + (partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index]).toFixed(2) + ' Fall of wicket: ' + fall_of_wicket);//console.log(" Partnership: ", partnership_runs[previous_partnership_index], "(", partnership_balls[previous_partnership_index], "), runrate: ", partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index]);
        }
        elt.commentary.push('  ' + team_object[+!toss].bowl_name[current_bowler] + ': ' + parseInt(deliveries[current_bowler] / 6) + '.' + deliveries[current_bowler] % 6 + '-' + maidens[current_bowler] + '-' + wickets_taken[current_bowler] + '-' + runs_conceded[current_bowler] + '-' + (runs_conceded[current_bowler] * 6 / deliveries[current_bowler]).toFixed(2) + '  ');//console.log(" Bowler ", current_bowler + 1, ": ", parseInt(deliveries[current_bowler] / 6) + "." + deliveries[current_bowler] % 6, "-", maidens[current_bowler], "-", wickets_taken[current_bowler], "-", runs_conceded[current_bowler] * 6 / deliveries[current_bowler], "  ");
        if (i < 19 && (Total[0] + 1 - Total[1]) / (19 - i) > 36) elt.commentary.push('The team might as well hop onto the team bus now.... ');//console.log("The team might as well hop onto the team bus now.... ");
        if (deliveries[current_bowler] == 24) elt.commentary.push('And that brings an end to Bowler ' + team_object[+!toss].bowl_name[current_bowler] + '\'s spell.  ');//console.log("And that brings an end to Bowler ", current_bowler + 1, "'score spell.  ");
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
            if (deliveries[j] <= 18 && team_object[+!toss].bowler_rating[j] > team_object[+!toss].bowler_rating[current_bowler] && j != previous_bowler) current_bowler = j;
        }
        previous_bowler = current_bowler;
    }

    elt.commentary.push(' Scorecard:');
    elt.commentary.push('Runs   Balls Strike Rate Fours Sixes  ');//console.log(" Scorecard:   Runs Balls Strike Rate Fours Sixes  ");
    for (i = 0; i < 11; ++i)
    {
        if (!balls[i])
        {
            elt.commentary.push(team_object[+toss].bat_name[i] + ' DNB ');
        }//console.log("  DNB ");
        else
        {
            elt.commentary.push(team_object[+toss].bat_name[i] + ' ' + score[i] + ' ' + balls[i] + ' ' + (score[i] * 100 / balls[i]).toFixed(2) + ' ' + fours[i] + ' ' + maximums[i]);//console.log(score[i], balls[i], score[i] * 100 / balls[i], fours[i], maximums[i]);
            if (!dismissed[i]) elt.commentary.push('  (not out)');//console.log("  (not out)");
        }
        if (i < 10)
        {
            partnership_runs[i] = partnership_balls[i] = 0;
        }
        balls[i] = fours[i] = maximums[i] = dismissed[i] = milestone[i] = score[i] = balls[i] = fours[i] = maximums[i] = 0;
    }
    elt.commentary.push('Total: ' + Total[1] + ' / ' + wickets[1] + ' (' + parseInt(Overs[1] / 6) + '.' + Overs[1] % 6 + ' overs)  Runrate: ' + (Total[1] * 6 / Overs[1]).toFixed(2) + ' Extras: ' + extras);
    elt.commentary.push(' Bowling Statistics:  ');
    elt.commentary.push('Bowler Overs Maidens Wickets Runs conceded Economy  ');//console.log("Total[0]: ", Total[0], " / ", wickets[0], " (", parseInt(Overs[0] / 6) + "." + Overs[0] % 6, " overs)  Runrate: ", Total[0] * 6 / Overs[0], " Extras: ", extras, "  Bowling Statistics:  Bowler Overs Maidens Wickets Runs conceded Economy  ");
    for (i = 0; i < 6; i++)
    {
        elt.commentary.push(team_object[+!toss].bowl_name[i] + ' ' + parseInt(deliveries[i] / 6) + '.' + deliveries[i] % 6 + ' ' + maidens[i] + ' ' + wickets_taken[i] + ' ' + runs_conceded[i] + ' ' + (runs_conceded[i] * 6 / deliveries[i]).toFixed(2));//console.log(i + 1, parseInt(deliveries[i] / 6) + "." + deliveries[i] % 6, maidens[i], wickets_taken[i], runs_conceded[i], runs_conceded[i] * 6 / deliveries[i]);
        five_wicket_haul[i] = continuous_wickets[i] = deliveries[i] = maidens[i] = runs_conceded[i] = wickets_taken[i] = 0;
    }
    elt.commentary.push('Dot ball percentage: ' + (dot * 100 / Overs[1]).toFixed(2) + ' %');//console.log("Dot ball percentage: ", dot * 100 / Overs[0], " %");
    extras = strike_index = free_hit = current_partnership_index = dot = previous_bowler = 0;
    previous_batsman = previous_partnership_index = -1;
    elt.commentary.push('   ');//console.log("Dot ball percentage: ", dot * 100 / Overs[1], " %");

    if (!(Total[0] - Total[1]))
    {
        if (!(wickets[0] - wickets[1]))
        {
            if (!(Overs[0] - Overs[1]))
            {
                elt.commentary.push('TIE ! ');
                winner_index = -1;
            }//console.log("TIE ! ");
            else
            {
                //elt.commentary.push( 'Team');//console.log("Team ");
                if (Overs[1] > Overs[0])
                {
                    elt.commentary[elt.commentary.length - 1] += users[+!toss]._id;
                    winner_index = +!toss;
                }//console.log(+!toss + 1);
                else
                {
                    elt.commentary[elt.commentary.length - 1] += users[+toss]._id;
                    winner_index = +toss;
                }//console.log(+toss + 1);
                elt.commentary[elt.commentary.length - 1] += ' wins! (higher run rate)  ';//console.log(" wins! (higher run rate)  ");
            }
        }
        else
        {
            //elt.commentary.push( 'Team');//console.log("Team ");
            if (wickets[0] > wickets[1])
            {
                elt.commentary[elt.commentary.length - 1] += users[+toss]._id;
                winner_index = +toss;
            }//console.log(+!toss + 1);
            else
            {
                elt.commentary[elt.commentary.length - 1] += users[+!toss]._id;
                winner_index = +!toss;
            }//console.log(+toss + 1);
            elt.commentary[elt.commentary.length - 1] += ' wins! (fewer wickets lost)  ';//console.log(" wins! (fewer wickets lost)  ");
        }
    }
    else
    {
        // elt.commentary.push( ' ' + users[+toss]._id + ' wins by '); //console.log("Team ");
        if (Total[0] < Total[1])
        {
            elt.commentary.push(users[+toss]._id + ' wins by ');
            elt.commentary[elt.commentary.length - 1] += (10 - wickets[1]) + ' wicket(s) !';//console.log(+toss + 1, " wins by ", 10 - wickets[1], " wicket(score) !");
            winner_index = +toss;
        }
        else
        {
            elt.commentary.push(users[+!toss]._id + ' wins by ');
            elt.commentary[elt.commentary.length - 1] += (Total[0] - Total[1]) + ' runs!';//console.log(+!toss + 1, " wins by ", Total[0] - Total[1], " runs!");
            winner_index = +!toss;
        }
        elt.commentary[elt.commentary.length - 1] += ' ';//console.log(" ");
    }
    var query, favour, against, net_run_rate, update;
    console.log("Winner Index " + winner_index);
    console.log("Winner " + users[+winner_index]._id);
    console.log("Loser " + users[+!winner_index]._id);
    if (parseInt(winner_index) == -1)
    {

        query = {"_id": users[0]._id};
        console.log("Index 1 " + query._id);
        favour = (parseInt(users[0].runs_for) + parseInt(Total[0])) / (parseInt(users[0].balls_for) + parseInt(Overs[0]));
        console.log("Favour " + parseFloat(favour));
        against = (parseInt(users[0].runs_against) + parseInt(Total[1])) / (parseInt(users[0].balls_against) + parseInt(Overs[1]));
        console.log("Against " + parseFloat(against));
        net_run_rate = (favour - against).toFixed(2);
        update = {$inc: {"played": 1, "tied": 1, "points": 1, "balls_for": Overs[0], "balls_against": Overs[1], "runs_for": Total[0], "runs_against": Total[1]}, $set: { "net_run_rate": net_run_rate}};
        var onUpdate = function (err, doc)
        {
            if (err)
            {
                if (log) log.log('debug', {Error: err, Message: err.message});
            }
            else
            {
                if (log) log.log('info', {Error: err, Doc: doc});
            }
        };
        mongoUserUpdate(query, update, function (err, doc)
        {
            query = {"_id": users[1]._id};
            console.log("Index 2 " + query._id);
            favour = (parseInt(users[1].runs_for) + parseInt(Total[1])) / (parseInt(users[1].balls_for) + parseInt(Overs[1]));
            console.log("Favour " + favour);
            against = (parseInt(users[1].runs_against) + parseInt(Total[0])) / (parseInt(users[1].balls_against) + parseInt(Overs[0]));
            console.log("Against " + against);
            net_run_rate = (favour - against).toFixed(2);
            update = {$inc: {"played": 1, "tied": 1, "points": 1, "balls_for": Overs[1], "balls_against": Overs[0], "runs_for": Total[1], "runs_against": Total[0]}, $set: { "net_run_rate": net_run_rate}};
            mongoUserUpdate(query, update, onUpdate);
        });

    }
    else
    {
        query = {"_id": users[+winner_index]._id};
        console.log("Index 1 " + query._id);
        favour = (parseInt(users[+winner_index].runs_for) + parseInt(Total[+winner_index])) / (parseInt(users[+winner_index].balls_for) + parseInt(Overs[+winner_index]));
        console.log("Favour " + favour);
        against = (parseInt(users[+winner_index].runs_against) + parseInt(Total[+!winner_index])) / (parseInt(users[+winner_index].balls_against) + parseInt(Overs[+!winner_index]));
        console.log("Against " + against);
        net_run_rate = (favour - against).toFixed(2);
        update = {$inc: {"played": 1, "win": 1, "points": 2, "balls_for": Overs[+winner_index], "balls_against": Overs[+!winner_index], "runs_for": Total[+winner_index], "runs_against": Total[+!winner_index]}, $set: { "net_run_rate": net_run_rate}};
        var onUpdate = function (err, doc)
        {
            if (err)
            {
                if (log) log.log('debug', {Error: err, Message: err.message});
            }
            else
            {
                if (log) log.log('info', {Error: err, Doc: doc});
            }
        };
        mongoUserUpdate(query, update, function (err, doc)
        {
            query = {"_id": users[+!winner_index]._id};
            console.log("Index 2 " + query._id);
            favour = (parseInt(users[+!winner_index].runs_for) + parseInt(Total[+!winner_index])) / (parseInt(users[+!winner_index].balls_for) + parseInt(Overs[+!winner_index]));
            console.log("Favour " + favour);
            against = (parseInt(users[+!winner_index].runs_against) + parseInt(Total[+winner_index])) / (parseInt(users[+!winner_index].balls_against) + parseInt(Overs[+winner_index]));
            console.log("Against " + against);
            net_run_rate = (favour - against).toFixed(2);
            update = {$inc: {"played": 1, "loss": 1, "balls_for": Overs[+!winner_index], "balls_against": Overs[+winner_index], "runs_for": Total[+!winner_index], "runs_against": Total[+winner_index]}, $set: { "net_run_rate": net_run_rate}};
            mongoUserUpdate(query, update, onUpdate);
        });
    }
    /*else if (parseInt(winner_index) == 1)
     {
     query = {"_id": users[1]._id};
     console.log("Index 1 " + query._id);
     favour = (parseInt(users[1].runs_for) + parseInt(Total[1])) / (parseInt(users[1].balls_for) + parseInt(Overs[1]));
     console.log("Favour "+ favour);
     against = (parseInt(users[1].runs_against) + parseInt(Total[0])) / (parseInt(users[1].balls_against) + parseInt(Overs[0]));
     console.log("Against "+ against);
     net_run_rate = (favour - against).toFixed(2);
     update = {$inc: {"played": 1, "wins": 1, "points": 2, "balls_for": Overs[1], "balls_against": Overs[1], "runs_for": Total[0], "runs_against": Total[1]}, $set: { "net_run_rate": net_run_rate}};
     var onUpdate = function (err, doc)
     {
     if (err)
     {
     if (log) log.log('debug', {Error: err, Message: err.message});
     }
     else
     {
     if (log) log.log('info', {Error: err, Doc: doc});
     }
     };
     mongoUserUpdate(query, update, function(err,doc)
     {
     query = {"_id": users[0]._id};
     console.log("Index 2 " + query._id);
     favour = (parseInt(users[0].runs_for) + parseInt(Total[0])) / (parseInt(users[0].balls_for) + parseInt(Overs[0]));
     console.log("Favour "+ favour);
     against = (parseInt(users[0].runs_against) + parseInt(Total[1])) / (parseInt(users[0].balls_against) + parseInt(Overs[1]));
     console.log("Against "+ against);
     net_run_rate = favour - against;
     update = {$inc: {"played": 1, "loss": 1, "points": 0, "balls_for": Overs[0], "balls_against": Overs[1], "runs_for": Total[1], "runs_against": Total[0]}, $set: { "net_run_rate": net_run_rate}};
     mongoUserUpdate(query, update, onUpdate);
     });
     }*/
    callback(null, elt);
    var mongoUserUpdate = function (query, update, callback)
    {
        var collection = db.collection("users");
        var onUpdate = function (err, doc)
        {
            if (err)
            {
                if (log) log.log('debug', {Error: err, Message: err.message});
                callback(true, null);
            }
            else
            {
                callback(null, doc);
            }
        };
        collection.findAndModify(query, {}, update, {"upsert": true}, onUpdate);
    };

}