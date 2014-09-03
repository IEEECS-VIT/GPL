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
var MongoClient = require('mongodb').MongoClient;
var path = require('path');

var com = require(path.join(__dirname, 'commentary'));

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';

var today = new Date();
var dateMatchDay;
var dot;
var users;
var collectionName;
var index = 0;
var toss_state;
var delivery_score;
var batsman_performance_index;
var current_bowler;
var bowler_performance_index;
var previous_bowler;
var toss;
var i;
var j;
var strike_index;
var continuous_maximums;
var fall_of_wicket;
var winner_index;
var commentary = '';
var dismissed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var five_wicket_haul = [0, 0, 0, 0, 0, 0];
var free_hit = 0, previous_partnership_index = -1;
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

exports.todaysMatches = function (callback)
{
    var onConnect = function (err, db)
    {
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
            collection.find({"_id": 1}).toArray(callback);
        }

    };
    MongoClient.connect(mongoUri, onConnect);


};

function rand()
{
    return parseInt(Math.random() * 1000000000000000);
}

team_object = [];

exports.team = function (elt, team1, team2, user1, user2)
{
    //console.log(team2);

    team_object[0] = new Make(team1);
    team_object[1] = new Make(team2);
    //console.log(team_object[0]);
    //console.log(team_object[1]);
    users = [user1, user2];
    start_match(elt);
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
                this.bowl_name[bowler_count] = team[i]['Name'];
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

function comment()
{
    commentary += '\nScorecard:\n\tRuns Balls Strike Rate Fours Sixes \n';//console.log("\nScorecard:\n\tRuns Balls Strike Rate Fours Sixes \n");
    for (i = 0; i < 11; ++i)
    {
        if (!balls[i])
        {
            commentary += '\tDNB\n';
        }//console.log("\tDNB\n");
        else
        {
            commentary += score[i] + ' ' + balls[i] + ' ' + score[i] * 100 / balls[i] + ' ' + fours[i] + ' ' + maximums[i];//console.log(score[i], balls[i], score[i] * 100 / balls[i], fours[i], maximums[i]);
            if (!dismissed[i]) commentary += '  (not out)';//console.log("  (not out)");
        }
        if (i < 10)
        {
            partnership_runs[i] = partnership_balls[i] = 0;
        }
        balls[i] = fours[i] = maximums[i] = dismissed[i] = milestone[i] = score[i] = balls[i] = fours[i] = maximums[i] = 0;
    }
    commentary += 'Total: ' + Total[index] + ' / ' + wickets[index] + ' (' + parseInt(Overs[index] / 6) + '.' + Overs[index] % 6 + ' overs)\tRunrate: ' + Total[index] * 6 / Overs[index] + '\nExtras: ' + extras + '\n\nBowling Statistics:\n\nBowler Overs Maidens Wickets Runs conceded Economy\n\n';//console.log("Total[0]: ", Total[0], " / ", wickets1, " (", parseInt(Overs[0] / 6) + "." + Overs[0] % 6, " overs)\tRunrate: ", Total[0] * 6 / Overs[0], "\nExtras: ", extras, "\n\nBowling Statistics:\n\nBowler Overs Maidens Wickets Runs conceded Economy\n\n");
    for (i = 0; i < 6; i++)
    {
        commentary += (i + 1) + ' ' + parseInt(deliveries[i] / 6) + '.' + deliveries[i] % 6 + ' ' + maidens[i] + ' ' + wickets_taken[i] + ' ' + runs_conceded[i] + ' ' + runs_conceded[i] * 6 / deliveries[i];//console.log(i + 1, parseInt(deliveries[i] / 6) + "." + deliveries[i] % 6, maidens[i], wickets_taken[i], runs_conceded[i], runs_conceded[i] * 6 / deliveries[i]);
        five_wicket_haul[i] = continuous_wickets[i] = deliveries[i] = maidens[i] = runs_conceded[i] = wickets_taken[i] = 0;
    }
    commentary += 'Dot ball percentage: ' + dot * 100 / Overs[index] + ' %';//console.log("Dot ball percentage: ", dot * 100 / Overs[0], " %");
    extras = strike_index = free_hit = current_partnership_index = Total[index] = dot = previous_bowler = 0;
    previous_batsman = previous_partnership_index = -1;
    commentary += '\n\n\n';
}


function post_over()
{
    if (deliveries[current_bowler] == 24) commentary += 'And that brings an end to Bowler ' + (current_bowler + 1) + '\'score spell.\n\n';//console.log("And that brings an end to Bowler ", current_bowler + 1, "'score spell.\n\n");
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
        if (deliveries[j] <= 18 && team_object[+!toss_state].bowler_rating[j] > team_object[+!toss_state].bowler_rating[current_bowler] && j != previous_bowler) current_bowler = j;
    }
    previous_bowler = current_bowler;

}

function score_runs()
{

    delivery_score = parseInt(batsman_performance_index);
    if (delivery_score < 0) delivery_score = 0;
    continuous_wickets[current_bowler] = 0;
    if (delivery_score > 6)
    {
        if (rand() % 2)
        {
            commentary += ' wide, ' + com.wide[rand() % com.wide.length];//console.log(" wide, ");
        }
        else
        {
            commentary += com.freehit[rand() % com.freehit.length];//console.log("No ball. An overstep was the last thing the bowling side needed...\n");
            free_hit = 1;
        }
        --j;
        ++extras;
        --partnership_balls[current_partnership_index];
        ++partnership_runs[current_partnership_index];
        --balls[strike[+strike_index]];
        --deliveries[current_bowler];
        ++Total[index];
    }
    else
    {
        if (free_hit) free_hit = 0;
        switch (delivery_score)
        {
            case 0:
                commentary += 'no run, ' + com.dot[rand() % com.dot.length];//console.log(" no run");
                //console.log(com.dot[rand()%com.dot.length]);
                ++dot;
                break;
            case 5:
                delivery_score -= 1;
            case 4:
                commentary += 'FOUR, ' + com.four[rand() % com.four.length];//console.log("FOUR");
                //console.log(com.four[rand()%com.four.length]);
                ++fours[strike[+strike_index]];
                break;
            case 6:
                commentary += 'SIX, ' + com.six[rand() % com.six.length];//console.log("SIX");
                //console.log(com.six[rand()%com.six.length]);
                ++maximums[strike[+strike_index]];
                ++continuous_maximums;
                break;
            case 1:
                commentary += '1 run, ' + com.one[rand() % com.one.length];
                break;
            case 2:
                commentary += '2 runs, ' + com.two[rand() % com.two.length];
                break;
            case 3:
                commentary += '3 runs, ' + com.three[rand() % com.three.length];
                break;
            default:
                break;
        }
        if (delivery_score != 6) continuous_maximums = 0;
        previous_over += delivery_score;
        score[strike[+strike_index]] += delivery_score;
        Total[index] += delivery_score;
        partnership_runs[current_partnership_index] += delivery_score;

    }
}

function start_match(elt)
{
    var wickets1, wickets2, dot;
    Overs[0] = Overs[1] = 120;
    Total[0] = Total[1] = 0;
    //console.log("\n", "Team ");
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
    commentary.toss = '\n' + users[toss].name + ' wins the toss and chooses to ';
    if (rand() % 2)
    {
        commentary.toss += 'bowl ';

    }//console.log(" wins the toss and chooses to bowl first");
    else
    {
        toss = !toss;
        commentary.toss += 'bat ';//console.log(" wins the toss and chooses to bat first");
    }
    commentary += 'first\n\n';
    if (+toss)
    {
        var temp = users[0];
        users[0] = users[1];
        users[1] = temp;
    }
    wickets1 = wickets2 = strike_index = previous_bowler = 0;
    toss_state = toss;
    for (i = 1; i < 6; ++i)
    {
        if (team_object[+toss].bowler_rating[i] > team_object[+toss].bowler_rating[previous_bowler])
        {
            previous_bowler = i;
        }
    }
    current_bowler = previous_bowler;
    commentary += team_object[+toss].bowl_name[previous_bowler] + ' to start proceedings from the pavillion end.....\n\n'; //console.log("\nBowler ", previous_bowler + 1, " to start proceedings from the pavillion end.....\n\n");
    dot = 0;
    for (i = 0; i < 20 && wickets[0] < 10; ++i)
    {
        previous_over = continuous_maximums = 0;
        if (deliveries[current_bowler] == 18)
        {
            commentary += 'So the captain has chosen to bowl ' + team_object[+toss].bowl_name[current_bowler] + ' out.\n';
        }//console.log("So the captain has chosen to bowl Bowler ", current_bowler + 1, " out.\n");
        if ((score[strike[+strike_index]] >= 44 && score[strike[+strike_index]] < 50))
        {
            commentary += team_object[+!toss].bat_name[strike[+strike_index]] + ' one hit away from a well deserving fifty. Will he make it ?\n\n';
        }//console.log("Batsman ", strike[+strike_index] + 1, " one hit away from a well deserving fifty. Will he make it ?\n\n");
        else if ((score[strike[+strike_index]] >= 94 && score[strike[+strike_index]] < 100))
        {
            commentary += team_object[+!toss].bat_name[strike[+strike_index]] + ' knows there is a hundred for the taking if he can knuckle this one down....\n\n';
        }//console.log("Batsman ", strike[+strike_index] + 1, " knows there is a hundred for the taking if he can knuckle this one down....\n\n");
        for (j = 1; j <= 6; ++j)
        {
            delivery_score = Math.abs(team_object[+!toss].bat_rating[strike[+strike_index]] - team_object[+toss].bowler_rating[current_bowler]);
            bowler_performance_index = (team_object[+toss].bowler_rating[current_bowler]) / ((rand() % (team_object[+toss].bowl_average[strike[+strike_index]] * team_object[+toss].bowler_rating[current_bowler] / 750 + 1) + team_object[+toss].bowl_average[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+toss].bowl_strike_rate[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 750 + 1) + team_object[+toss].bowl_strike_rate[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+toss].economy[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 750 + 1) + team_object[+toss].economy[current_bowler] * team_object[+toss].bowler_rating[current_bowler] / 1000));
            batsman_performance_index = (rand() % (team_object[+!toss].bat_average[strike[+strike_index]] * team_object[+!toss].bat_rating[strike[+strike_index]] / 1000 + 1) + team_object[+!toss].bat_average[strike[+strike_index]] * (1000 - team_object[+!toss].bat_rating[strike[+strike_index]]) / 1000) * (rand() % (team_object[+!toss].bat_strike_rate[strike[+strike_index]] * team_object[+!toss].bat_rating[strike[+strike_index]] / 1000 + 1) + team_object[+!toss].bat_strike_rate[strike[+strike_index]] * (1000 - team_object[+!toss].bat_rating[strike[+strike_index]]) / 1000) / team_object[+toss].bowler_rating[current_bowler];
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
                commentary += '\nFree Hit: ';
            }//console.log("\nFree Hit: ");
            else
            {
                commentary += '\n' + i + '.' + j + team_object[+toss].bowl_name[current_bowler] + ' to ' + team_object[+!toss].bat_name[strike[+strike_index]] + ', ';
            }//console.log(i + "." + j, " Bowler ", current_bowler + 1, " to Batsman ", strike[+strike_index] + 1, ", ");
            if (batsman_performance_index <= 0 && !free_hit)
            {
                previous_batsman = strike[+strike_index];
                dismissed[strike[+strike_index]] = 1;
                commentary += 'OUT ';//console.log("OUT ");
                previous_dismissal = current_bowler;
                ++continuous_wickets[current_bowler];
                previous_partnership_index = current_partnership_index;
                ++wickets_taken[current_bowler];
                if (batsman_performance_index <= 0 && batsman_performance_index > -0.5)
                {
                    commentary += com.caught[rand() % com.caught.length];
                    /*console.log("(caught)"); console.log(com.caught[rand()%com.caught.length]);*/
                }
                else if (batsman_performance_index <= -0.5 && batsman_performance_index > -1)
                {
                    commentary += com.bowled[rand() % com.bowled.length];
                    /*console.log("(bowled)"); console.log(com.bowled[rand()%com.bowled.length]);*/
                }
                else if (batsman_performance_index <= -1 && batsman_performance_index > -1.5)
                {
                    commentary += com.lbw[rand() % com.lbw.length];
                    /*console.log("(LBW)"); console.log(com.lbw[rand()%com.lbw.length]);*/
                }
                else if (batsman_performance_index <= -1.5 && batsman_performance_index > -2)
                {
                    commentary += com.stumped[rand() % com.stumped.length];
                    /*console.log("(stumped)"); console.log(com.stumped[rand()%com.stumped.length]);*/
                }
                else
                {
                    delivery_score = rand() % 3;
                    if (delivery_score)
                    {
                        commentary += '  ' + delivery_score + ' run(score),\n';//console.log("  ", delivery_score, " run(score), ");
                        partnership_runs[current_partnership_index] += delivery_score;
                        score[strike[+strike_index]] += delivery_score;
                        previous_over += delivery_score;
                        Total[0] += delivery_score;

                    }
                    if (rand() % 2)
                    {
                        strike_index = !strike_index;
                    }
                    commentary += com.runout[rand() % com.runout.length];//console.log(com.runout[rand()%com.runout.length]);
                    previous_dismissal = -1;
                    continuous_wickets[current_bowler] = 0;
                    --wickets_taken[current_bowler];
                }
                if (balls[strike[+strike_index]] == 1) commentary += ' first ball ';//console.log(" first ball ");
                if (!score[strike[+strike_index]]) commentary += ' for a duck ! ';//console.log("for a duck !");
                if (wickets_taken[current_bowler] == 5 && !five_wicket_haul[current_bowler])
                {
                    five_wicket_haul[current_bowler] = 1;
                    commentary += ', that brings up his five wicket haul, yet another tick in a list of accomplishments.';//console.log(", that brings up his five wicket haul, yet another tick in a list of accomplishments.");
                }
                if (score[strike[+strike_index]] >= 45 && score[strike[+strike_index]] < 50)
                {
                    commentary += '\nlooks like there won\'strike_index be any fifty for ' + team_object[+!toss].bat_name[strike[+strike_index]] + ', he came so close, and was yet so far.\n';
                }//console.log("\nlooks like there won'strike_index be any fifty for Batsman ", strike[+strike_index], ", he came so close, and was yet so far.\n");
                else if (score[strike[+strike_index]] >= 90 && score[strike[+strike_index]] < 100) commentary += '\nHe\'ll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team.\n';//console.log("\nHe'll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team.\n");
                if (continuous_wickets[current_bowler] == 3)
                {
                    commentary += '\nAnd that is also a hattrick for bowler ' + team_object[!toss].bowl_name[current_bowler] + '! Fantastic bowling in the time of need.';//console.log("\nAnd that is also a hattrick for bowler ", current_bowler + 1, "! Fantastic bowling in the time of need.");
                    continuous_wickets[current_bowler] = 0;
                }
                commentary += '\n ' + team_object[+!toss].bat_name[strike[+strike_index]];//console.log("\nBatsman ", strike[+strike_index] + 1);
                if (previous_dismissal > -1)
                {
                    commentary += ', ' + team_object[+toss].bowl_name[current_bowler];
                }//console.log(", Bowler ", current_bowler + 1);
                else
                {
                    commentary += ' runout';
                }//console.log(" runout");
                commentary += ' ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ' balls' + ' ' + fours[strike[+strike_index]] + 'X4\'score ' + maximums[strike[+strike_index]] + 'X6\'score) SR: ' + score[strike[+strike_index]] * 100 / balls[strike[+strike_index]] + '\nPartnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ')' + ', Runrate: ' + partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index];//console.log(" ", score[strike[+strike_index]], " (", balls[strike[+strike_index]], " balls", " ", fours[strike[+strike_index]], "X4'score ", maximums[strike[+strike_index]], "X6'score) SR: ", score[strike[+strike_index]] * 100 / balls[strike[+strike_index]], "\nPartnership: ", partnership_runs[current_partnership_index], "(", partnership_balls[current_partnership_index], ")", ", Runrate: ", partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]);
                ++current_partnership_index;
                strike[+strike_index] = (strike[+strike_index] > strike[+!strike_index] ? strike[+strike_index] : strike[+!strike_index]) + 1;
                if (batsman_performance_index <= -0 && batsman_performance_index >= -0.5 && rand() % 2)
                {
                    strike_index = !strike_index;
                    commentary += '\nThe two batsmen crossed over while the catch was being taken.';//console.log("\nThe two batsmen crossed over while the catch was being taken.");
                }
                if (wickets[0]++ == 9)
                {
                    Overs[0] = 6 * i + j;
                    commentary += '\nAnd that wraps up the innings.\n';//console.log("\nAnd that wraps up the innings.\n");
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
                score_runs();
                if (!milestone[strike[+strike_index]] && score[strike[+strike_index]] >= 50)
                {
                    ++milestone[strike[+strike_index]];
                    commentary += ' And that brings up his half century - a well timed innings indeed.';//console.log(" And that brings up his half century - a well timed innings indeed.");
                }
                else if (milestone[strike[+strike_index]] == 1 && score[strike[+strike_index]] >= 100)
                {
                    ++milestone[strike[+strike_index]];
                    commentary += ' what a wonderful way to bring up his century.';//console.log(" what a wonderful way to bring up his century.");
                }
                if (delivery_score % 2) strike_index = !strike_index;
            }
        }
        if (continuous_maximums == 6) commentary += '\nSix G.P.L maximums in the previous over ! What an effort by ' + team_object[+!toss].bat_name[strike[+strike_index]] + '. The crowd is ecstatic, ' + team_object[+toss].bowl_name[current_bowler] + ' is absolutely flabbergasted.\n';//console.log("\nSix G.P.L maximums in the previous over ! What an effort by Batsman.", strike[+strike_index], ". The crowd is ecstatic, Bowler ", current_bowler, " is absolutely flabbergasted.\n");
        runs_conceded[current_bowler] += previous_over;
        strike_index = !strike_index;
        commentary += '\nLast over: ';//console.log("\nLast over: ");
        if (previous_over)
        {
            commentary += previous_over + ' run(score)';
        }//console.log(previous_over, " run(score)");
        else
        {
            if (j == 7) commentary += 'maiden';//console.log("maiden");
            maidens[current_bowler] += 1;
        }
        commentary += '\n Current score: ' + Total[0] + ' / ' + wickets1 + '\tRunrate: ' + Total[0] / (i + 1);//console.log("\n Current score: ", Total[0], " / ", wickets1, "\tRunrate: ", Total[0] / (i + 1));
        if (strike[+strike_index] < 11) commentary += ' ' + team_object[+!toss].bat_name[strike[+strike_index]] + ' : ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ') ';//console.log("Batsman: ", strike[+strike_index] + 1, " : ", score[strike[+strike_index]], " (", balls[strike[+strike_index]], ") ");
        if (strike[+!strike_index] < 11) commentary += ' ' + team_object[+!toss].bat_name[strike[+!strike_index]] + ' : ' + score[strike[+!strike_index]] + ' (' + balls[strike[+!strike_index]] + ')\nPartnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ')+ runrate: ' + partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index];//console.log("Batsman: ", strike[+!strike_index] + 1, " : ", score[strike[+!strike_index]], " (", balls[strike[+!strike_index]], ")\nPartnership: ", partnership_runs[current_partnership_index], "(", partnership_balls[current_partnership_index], "), runrate: ", partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]);
        if (previous_batsman > -1)
        {
            commentary += '\nPrevious Wicket: ' + team_object[+!toss].bat_name[previous_batsman] + ': ' + score[previous_batsman] + '(' + balls[previous_batsman] + ')';//console.log("\nPrevious Wicket: Batsman ", previous_batsman + 1, ": ", score[previous_batsman], "(", balls[previous_batsman], ")");
            if (previous_dismissal > -1)
            {
                commentary += ', Dismissed by: ' + team_object[+toss].bowl_name[previous_dismissal];
            }//console.log(", Dismissed by: Bowler ", previous_dismissal + 1);
            else
            {
                commentary += '(runout)';
            }//console.log("(runout)");
            commentary += '\nPartnership: ' + partnership_runs[previous_partnership_index] + '(' + partnership_balls[previous_partnership_index] + '), runrate: ' + partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index] + '\nFall of wicket: ' + fall_of_wicket;//console.log("\nPartnership: ", partnership_runs[previous_partnership_index], "(", partnership_balls[previous_partnership_index], "), runrate: ", partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index]);
            //console.log("Fall of wicket: ",fall_of_wicket);
        }
        commentary += '\n ' + team_object[+toss].bowl_name[current_bowler] + ': ' + deliveries[current_bowler] / 6 + '.' + deliveries[current_bowler] % 6 + '-' + maidens[current_bowler] + '-' + wickets_taken[current_bowler] + '-' + runs_conceded[current_bowler] * 6 / deliveries[current_bowler] + '\n\n';//console.log("\nBowler ", current_bowler + 1, ": ", deliveries[current_bowler] / 6 + "." + deliveries[current_bowler] % 6, "-", maidens[current_bowler], "-", wickets_taken[current_bowler], "-", runs_conceded[current_bowler] * 6 / deliveries[current_bowler], "\n\n");
        post_over();
    }
    strike = [0, 1];
    comment();
    index = 1;
    toss_state = !toss_state;
//console.log(commentary);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for (i = 1; i < 6; i++)
    {
        if (team_object[+!toss].bowler_rating[i] > team_object[+!toss].bowler_rating[previous_bowler])
        {
            previous_bowler = i;
        }
    }
    current_bowler = previous_bowler;
    commentary += '\n ' + team_object[+!toss].bowl_name[previous_bowler] + ' to start proceedings from the pavillion end.....\n\n';//console.log("\nBowler ", previous_bowler + 1, " to start proceedings from the pavillion end.....\n\n");
    dot = 0;
    for (i = 0; i < 20 && (wickets[1] < 10 && Total[0] <= Total[1]); ++i)
    {
        previous_over = continuous_maximums = 0;
        if (deliveries[current_bowler] == 18)
        {
            commentary += '\nSo the captain has chosen to bowl ' + team_object[+!toss].bowl_name[current_bowler] + ' out.\n';
        }//console.log("So the captain has chosen to bowl Bowler ", current_bowler + 1, " out.\n");
        if ((score[strike[+strike_index]] >= 44 && score[strike[+strike_index]] < 50))
        {
            commentary += '\n ' + team_object[+toss].bat_name[strike[+strike_index]] + ' one hit away from a well deserving fifty. Will he make it ?\n\n';
        }//console.log("Batsman ", strike[+strike_index] + 1, " one hit away from a well deserving fifty. Will he make it ?\n\n");
        else if ((score[strike[+strike_index]] >= 94 && score[strike[+strike_index]] < 100))
        {
            commentary += '\n ' + team_object[+toss].bat_name[strike[+strike_index]] + ' knows there is a hundred for the taking if he can knuckle this one down....\n\n';
        }//console.log("Batsman ", strike[+strike_index] + 1, " knows there is a hundred for the taking if he can knuckle this one down....\n\n");
        for (j = 1; j <= 6; ++j)
        {
            delivery_score = Math.abs(team_object[+toss].bat_rating[strike[+strike_index]] - team_object[+!toss].bowler_rating[current_bowler]);
            bowler_performance_index = (team_object[+!toss].bowler_rating[current_bowler]) / ((rand() % (team_object[+!toss].bowl_average[strike[+strike_index]] * team_object[+!toss].bowler_rating[current_bowler] / 750 + 1) + team_object[+!toss].bowl_average[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+!toss].bowl_strike_rate[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 750 + 1) + team_object[+!toss].bowl_strike_rate[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000) * (rand() % (team_object[+!toss].economy[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 750 + 1) + team_object[+!toss].economy[current_bowler] * team_object[+!toss].bowler_rating[current_bowler] / 1000));
            batsman_performance_index = (rand() % (team_object[+toss].bat_average[strike[+strike_index]] * team_object[+toss].bat_rating[strike[+strike_index]] / 1000 + 1) + team_object[+toss].bat_average[strike[+strike_index]] * (1000 - team_object[+toss].bat_rating[strike[+strike_index]]) / 1000) * (rand() % (team_object[+toss].bat_strike_rate[strike[+strike_index]] * team_object[+toss].bat_rating[strike[+strike_index]] / 1000 + 1) + team_object[+toss].bat_strike_rate[strike[+strike_index]] * (1000 - team_object[+toss].bat_rating[strike[+strike_index]]) / 1000) / team_object[+!toss].bowler_rating[current_bowler];
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
                commentary += '\nFree Hit: ';
            }//console.log("\nFree Hit: ");
            else
            {
                commentary += '\n' + i + '.' + j + ' ' + team_object[+!toss].bowl_name[current_bowler] + ' to ' + team_object[+toss].bat_name[strike[+strike_index]] + ', ';
            }//console.log(i + "." + j, " Bowler ", current_bowler + 1, " to Batsman ", strike[+strike_index] + 1, ", ");
            if (batsman_performance_index <= 0 && !free_hit)
            {
                previous_batsman = strike[+strike_index];
                dismissed[strike[+strike_index]] = 1;
                commentary += 'OUT ';//console.log("OUT ");
                previous_dismissal = current_bowler;
                ++continuous_wickets[current_bowler];
                previous_partnership_index = current_partnership_index;
                ++wickets_taken[current_bowler];
                if (batsman_performance_index <= 0 && batsman_performance_index > -0.5)
                {
                    commentary += com.caught[rand() % com.caught.length];
                    /*console.log("(caught)"); console.log(com.caught[rand()%com.caught.length]);*/
                }
                else if (batsman_performance_index <= -0.5 && batsman_performance_index > -1)
                {
                    commentary += com.bowled[rand() % com.bowled.length];
                    /*console.log("(bowled)"); console.log(com.bowled[rand()%com.bowled.length]);*/
                }
                else if (batsman_performance_index <= -1 && batsman_performance_index > -1.5)
                {
                    commentary += com.lbw[rand() % com.lbw.length];
                    /*console.log("(LBW)"); console.log(com.lbw[rand()%com.lbw.length]);*/
                }
                else if (batsman_performance_index <= -1.5 && batsman_performance_index > -2)
                {
                    commentary += com.stumped[rand() % com.stumped.length];
                    /*console.log("(stumped)"); console.log(com.stumped[rand()%com.stumped.length]);*/
                }
                else
                {
                    delivery_score = rand() % 3;
                    if (delivery_score)
                    {
                        commentary += '  ' + delivery_score + ' run(score), ';//console.log("  ", delivery_score, " run(score), ");
                        partnership_runs[current_partnership_index] += delivery_score;
                        score[strike[+strike_index]] += delivery_score;
                        previous_over += delivery_score;
                        Total[1] += delivery_score;
                    }
                    if (rand() % 2)
                    {
                        strike_index = !strike_index;
                    }
                    commentary += com.runout[rand() % com.runout.length];//console.log(com.runout[rand()%com.runout.length]);
                    previous_dismissal = -1;
                    continuous_wickets[current_bowler] = 0;
                    --wickets_taken[current_bowler];
                    if (Total[1] > Total[0])
                    {
                        commentary += '\nWhat an emphatic victory ! ';//console.log("What an emphatic victory ! ");
                        break;
                    }
                    else if (Total[1] == Total[0]) commentary += 'Scores are level...';//console.log("Scores are level...");
                }
                if (balls[strike[+strike_index]] == 1) commentary += ' first ball ';//console.log(" first ball ");
                if (!score[strike[+strike_index]]) commentary += 'for a duck !';//console.log("for a duck !");
                if (wickets_taken[current_bowler] == 5 && !five_wicket_haul[current_bowler])
                {
                    five_wicket_haul[current_bowler] = 1;
                    commentary += ', that brings up his five wicket haul, yet another tick in a list of accomplishments.';//console.log(", that brings up his five wicket haul, yet another tick in a list of accomplishments.");
                }
                if (score[strike[+strike_index]] >= 45 && score[strike[+strike_index]] < 50)
                {
                    commentary += '\nlooks like there won\'strike_index be any fifty for ' + team_object[+toss].bat_name[strike[+strike_index]] + ', he came so close, and was yet so far.\n';
                }//console.log("\nlooks like there won'strike_index be any fifty for Batsman ", strike[+strike_index], ", he came so close, and was yet so far.\n");
                else if (score[strike[+strike_index]] >= 90 && score[strike[+strike_index]] < 100) commentary += '\nHe\'ll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team.\n';//console.log("\nHe'll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team.\n");
                if (continuous_wickets[current_bowler] == 3)
                {
                    commentary += '\nAnd that is also a hattrick for ' + team_object[+!toss].bowl_name[current_bowler] + '! Fantastic bowling in the time of need.';//console.log("\nAnd that is also a hattrick for bowler ", current_bowler + 1, "! Fantastic bowling in the time of need.");
                    continuous_wickets[current_bowler] = 0;
                }
                commentary += '\n ' + team_object[+toss].bat_name[strike[+strike_index]];//console.log("\nBatsman ", strike[+strike_index] + 1);
                if (previous_dismissal > -1)
                {
                    commentary += ', ' + team_object[+!toss].bowl_name[current_bowler];
                }//console.log(", Bowler ", current_bowler + 1);
                else
                {
                    commentary += ' runout';
                }//console.log(" runout");
                commentary += ' ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ' balls' + ' ' + fours[strike[+strike_index]] + 'X4\'score ' + maximums[strike[+strike_index]] + 'X6\'score) SR: ' + score[strike[+strike_index]] * 100 / balls[strike[+strike_index]] + '\nPartnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + ')' + ', Runrate: ' + partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index];//console.log(" ", score[strike[+strike_index]], " (", balls[strike[+strike_index]], " balls", " ", fours[strike[+strike_index]], "X4'score ", maximums[strike[+strike_index]], "X6'score) SR: ", score[strike[+strike_index]] * 100 / balls[strike[+strike_index]], "\nPartnership: ", partnership_runs[current_partnership_index], "(", partnership_balls[current_partnership_index], ")", ", Runrate: ", partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]);
                ++current_partnership_index;
                strike[+strike_index] = (strike[+strike_index] > strike[+!strike_index] ? strike[+strike_index] : strike[+!strike_index]) + 1;
                if (batsman_performance_index <= -0 && batsman_performance_index >= -0.5 && rand() % 2)
                {
                    strike_index = !strike_index;
                    commentary += '\nThe two batsmen crossed over while the catch was being taken.';//console.log("\nThe two batsmen crossed over while the catch was being taken.");
                }
                if (wickets2++ == 9)
                {
                    Overs[1] = 6 * i + j;
                    commentary += '\nAnd that wraps up the innings.\n';//console.log("\nAnd that wraps up the innings.\n");
                    break;
                }
                batsman_performance_index = i;
                if (j == 6)
                {
                    j = 0;
                    ++batsman_performance_index;
                }
                fall_of_wicket = Total[1] + ' / ' + wickets2 + ', ' + batsman_performance_index + '.' + j;
            }
            else
            {
                score_runs();
                if (Total[1] == Total[0])
                {
                    commentary += '\nScores are level now...\n';
                }//console.log("\nScores are level now...\n");
                else if (Total[1] > Total[0])
                {
                    commentary += '\nAnd they have done it! What an emphatic victory !\n';//console.log("\nAnd they have done it! What an emphatic victory !\n");
                    Overs[1] = 6 * i + j;
                    break;
                }
                if (!milestone[strike[+strike_index]] && score[strike[+strike_index]] >= 50)
                {
                    ++milestone[strike[+strike_index]];
                    commentary += ' And that brings up his half century - a well timed innings indeed.';//console.log(" And that brings up his half century - a well timed innings indeed.");
                }
                else if (milestone[strike[+strike_index]] == 1 && score[strike[+strike_index]] >= 100)
                {
                    ++milestone[strike[+strike_index]];
                    commentary += ' what a wonderful way to bring up his century.';//console.log(" what a wonderful way to bring up his century.");
                }
                if (delivery_score % 2) strike_index = !strike_index;
            }
        }

        if (continuous_maximums == 6) commentary += '\nSix G.P.L maximums in the previous over ! What an effort by ' + team_object[+toss].bat_name[strike[+strike_index]] + '. The crowd is ecstatic, ' + team_object[+!toss].bowl_name[current_bowler] + ' is absolutely flabbergasted.\n';//console.log("\nSix G.P.L maximums in the previous over ! What an effort by Batsman.", strike[+strike_index], ". The crowd is ecstatic, Bowler ", current_bowler, " is absolutely flabbergasted.\n");
        runs_conceded[current_bowler] += previous_over;
        strike_index = !strike_index;
        commentary += '\nLast over: ';//console.log("\nLast over: ");
        if (previous_over)
        {
            commentary += previous_over + " run(score)";
        }//console.log(previous_over, " run(score)");
        else
        {
            if (j == 7) commentary += 'maiden';//console.log("maiden");
            maidens[current_bowler] += 1;
        }
        commentary += '\n Current score: ' + Total[1] + ' / ' + wickets2 + '\tRunrate: ' + Total[1] / (i + 1);//console.log("\n Current score: ", Total[1], " / ", wickets2, "\tRunrate: ", Total[1] / (i + 1));
        if (Total[1] > Total[0]) break;
        commentary += ', RRR: ' + (Total[0] + 1 - Total[1]) / (19 - i) + '\n Equation: ' + (Total[0] + 1 - Total[1]) + ' runs needed from ' + 114 - 6 * i + ' balls.\n';//console.log(", RRR: ", (Total[0] + 1 - Total[1]) / (19 - i), "\n Equation: ", (Total[0] + 1 - Total[1]), " runs needed from ", 114 - 6 * i, " balls.\n");
        if (strike[+strike_index] < 11) commentary += ' ' + team_object[+toss].bat_name[strike[+strike_index]] + ' : ' + score[strike[+strike_index]] + ' (' + balls[strike[+strike_index]] + ') ';//console.log("Batsman: ", strike[+strike_index] + 1, " : ", score[strike[+strike_index]], " (", balls[strike[+strike_index]], ") ");
        if (strike[+!strike_index] < 11) commentary += ' ' + team_object[+toss].bat_name[strike[+!strike_index]] + ' : ' + score[strike[+!strike_index]] + ' (' + balls[strike[+!strike_index]] + ')\nPartnership: ' + partnership_runs[current_partnership_index] + '(' + partnership_balls[current_partnership_index] + '), runrate: ' + partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index];//console.log("Batsman: ", strike[+!strike_index] + 1, " : ", score[strike[+!strike_index]], " (", balls[strike[+!strike_index]], ")\nPartnership: ", partnership_runs[current_partnership_index], "(", partnership_balls[current_partnership_index], "), runrate: ", partnership_runs[current_partnership_index] * 6 / partnership_balls[current_partnership_index]);
        if (previous_batsman > -1)
        {
            commentary += '\nPrevious Wicket: ' + team_object[+toss].bat_name[previous_batsman] + ': ' + score[previous_batsman] + '(' + balls[previous_batsman] + ')';//console.log("\nPrevious Wicket: Batsman ", previous_batsman + 1, ": ", score[previous_batsman], "(", balls[previous_batsman], ")");
            if (previous_dismissal > -1)
            {
                commentary += ', Dismissed by: ' + team_object[+!toss].bowl_name[previous_dismissal];
            }//console.log(", Dismissed by: Bowler ", previous_dismissal + 1);
            else
            {
                commentary += '(runout)';
            }//console.log("(runout)");
            commentary += '\nPartnership: ' + partnership_runs[previous_partnership_index] + '(' + partnership_balls[previous_partnership_index] + '), runrate: ' + partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index];//console.log("\nPartnership: ", partnership_runs[previous_partnership_index], "(", partnership_balls[previous_partnership_index], "), runrate: ", partnership_runs[previous_partnership_index] * 6 / partnership_balls[previous_partnership_index]);
        }
        commentary += '\n ' + team_object[+!toss].bowl_name[current_bowler] + ': ' + parseInt(deliveries[current_bowler] / 6) + '.' + deliveries[current_bowler] % 6 + '-' + maidens[current_bowler] + '-' + wickets_taken[current_bowler] + '-' + runs_conceded[current_bowler] * 6 / deliveries[current_bowler] + '\n\n';//console.log("\nBowler ", current_bowler + 1, ": ", parseInt(deliveries[current_bowler] / 6) + "." + deliveries[current_bowler] % 6, "-", maidens[current_bowler], "-", wickets_taken[current_bowler], "-", runs_conceded[current_bowler] * 6 / deliveries[current_bowler], "\n\n");
        if (i < 19 && (Total[0] + 1 - Total[1]) / (19 - i) >= 36) commentary += 'The team might as well hop onto the team bus now....\n';//console.log("The team might as well hop onto the team bus now....\n");
        post_over();
    }

    comment();//console.log("Dot ball percentage: ", dot * 100 / Overs[1], " %");

    if (!(Total[0] - Total[1]))
    {
        if (!(wickets1 - wickets2))
        {
            if (!(Overs[0] - Overs[1]))
            {
                commentary += 'TIE !\n';
                winner_index = -1;
            }//console.log("TIE !\n");
            else
            {
                commentary += 'Team';//console.log("Team ");
                if (Overs[1] > Overs[0])
                {
                    commentary += (+!toss + 1);
                    winner_index = +!toss;
                }//console.log(+!toss + 1);
                else
                {
                    commentary += (+toss + 1);
                    winner_index = +toss;
                }//console.log(+toss + 1);
                commentary += ' wins! (higher run rate)\n\n';//console.log(" wins! (higher run rate)\n\n");
            }
        }
        else
        {
            commentary += 'Team';//console.log("Team ");
            if (wickets1 > wickets2)
            {
                commentary += (+!toss + 1);
                winner_index = +!toss;
            }//console.log(+!toss + 1);
            else
            {
                commentary += (+toss + 1);
                winner_index = +toss;
            }//console.log(+toss + 1);
            commentary += ' wins! (fewer wickets lost)\n\n';//console.log(" wins! (fewer wickets lost)\n\n");
        }
    }
    else
    {
        commentary += 'Team ' + (+toss + 1) + ' wins by '; //console.log("Team ");
        winner_index = +toss;
        if (Total[0] < Total[1])
        {
            commentary += (10 - wickets2) + ' wicket(score) !';//console.log(+toss + 1, " wins by ", 10 - wickets2, " wicket(score) !");

        }
        else
        {
            commentary += (Total[0] - Total[1]) + ' runs!';//console.log(+!toss + 1, " wins by ", Total[0] - Total[1], " runs!");
        }
        commentary += '\n';//console.log("\n");
    }

    if (parseInt(winner_index) == -1)
    {
        var onAddTie = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(doc);
            }
        };
        var onFinish = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(doc);
            }
        };
        var credentials1 = {
            "_id": users[0]._id
        };
        var credentials2 = {
            "_id": users[0]._id
        };
        addtie(credentials1, credentials2, onAddTie);
        updateMatch(elt, commentary, onFinish);
    }
    else if (parseInt(winner_index) == 0)
    {
        var winner =
        {
            "_id": users[0]._id
        };
        var loser =
        {
            "_id": users[1]._id
        };
        var onAddResult = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(doc);
            }
        };
        var onFinish = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(doc);
            }
        };
        addresult(winner, loser, onAddResult);
        updateMatch(elt, commentary, onFinish);
    }
    else if (parseInt(winner_index) == 1)
    {
        var winner =
        {
            "_id": users[1]._id
        };
        var loser =
        {
            "_id": users[0]._id
        };
        var onAddResult = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(doc);
            }
        };
        var onFinish = function (err, doc)
        {
            if (err)
            {
                console.log(err.message);
            }
            else
            {
                console.log(doc);
            }
        };
        addresult(winner, loser, onAddResult);
        updateMatch(elt, commentary, onFinish);

    }
}

function addtie(document1, document2, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            var parallel_tasks = {};
            var collection = db.collection('users');
            var onUpdate = function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else if (document)
                {
                    db.close();
                    callback(null, document);
                }
                else
                {
                    callback(true, null);
                }
            };
            parallel_tasks.team1 = function (asyncCallback)
            {
                var net_run_rate1 = 6 * (  parseFloat((parseInt(users[0].runs_for) + parseInt(Total[0]) ) / ( parseInt(users[0].balls_for) + parseInt(Overs[0]))) - parseFloat((parseInt(users[0].runs_against) + parseInt(Total[1]) ) / ( parseInt(users[0].balls_against) + parseInt(Overs[1]))));
                collection.findAndModify(document1, [], {$inc: {played: 1, points: 1, runs_for: Total[0], runs_against: Total[0], balls_for: Overs[0], balls_against: Overs[0]}}, {$set: { net_run_rate: net_run_rate1}}, {}, asyncCallback);
            };
            parallel_tasks.team2 = function (asyncCallback)
            {
                var net_run_rate2 = 6 * (  parseFloat((parseInt(users[1].runs_for) + parseInt(Total[1]) ) / ( parseInt(users[1].balls_for) + parseInt(Overs[1]))) - parseFloat((parseInt(users[1].runs_against) + parseInt(Total[0]) ) / ( parseInt(users[1].balls_against) + parseInt(Overs[0]))));
                collection.findAndModify(document2, [], {$inc: {played: 1, points: 1, runs_for: Total[0], runs_against: Total[0], balls_for: Overs[0], balls_against: Overs[0]}}, {$set: { net_run_rate: net_run_rate2}}, {}, asyncCallback);
            };
            async.parallel(parallel_tasks, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
}

function addresult(winner, loser, callback)
{
    var parallel_tasks = {};
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            var collection = db.collection('users');
            var onUpdate = function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else if (document)
                {
                    db.close();
                    callback(null, document);
                }
                else
                {
                    callback(true, null);
                }
            };
            parallel_tasks.team1 = function (asyncCallback)
            {
                var net_run_rate1 = 6 * (  parseFloat((parseInt(users[0].runs_for) + parseInt(Total[0]) ) / ( parseInt(users[0].balls_for) + parseInt(Overs[0]))) - parseFloat((parseInt(users[0].runs_against) + parseInt(Total[1]) ) / ( parseInt(users[0].balls_against) + parseInt(Overs[1]))));
                collection.findAndModify(winner, [], {$inc: {played: 1, points: 1, runs_for: Total[0], runs_against: Total[1], balls_for: Overs[0], balls_against: Overs[0]}}, {$set: { net_run_rate: net_run_rate1}}, {}, asyncCallback);
            };
            parallel_tasks.team2 = function (asyncCallback)
            {
                var net_run_rate2 = 6 * (  parseFloat((parseInt(users[1].runs_for) + parseInt(Total[1]) ) / ( parseInt(users[1].balls_for) + parseInt(Overs[1]))) - parseFloat((parseInt(users[1].runs_against) + parseInt(Total[0]) ) / ( parseInt(users[1].balls_against) + parseInt(Overs[0]))));
                collection.findAndModify(loser, [], {$inc: {played: 1, points: 1, runs_for: Total[1], runs_against: Total[0], balls_for: Overs[1], balls_against: Overs[0]}}, {$set: { net_run_rate: net_run_rate2}}, {}, asyncCallback);
            };
            async.parallel(parallel_tasks, onUpdate);
            collection.findAndModify(winner, [], {$inc: {played: 1, win: 1, points: 2, runs_for: Total[+winner_index], runs_against: Total[+!winner_index], balls_for: Overs[+winner_index], balls_against: Overs[+!winner_index]}}, {$set: { net_run_rate: 6 * (this.runs_for / this.balls_for - this.runs_against / this.balls_against)}}, {}, onUpdate);

            collection.findAndModify(loser, [], {$inc: {played: 1, runs_for: Total[+!winner_index], runs_against: Total[+winner_index], balls_for: Overs[+winner_index], balls_against: Overs[+!winner_index]}}, {$set: { net_run_rate: 6 * (this.runs_for / this.balls_for - this.runs_against / this.balls_against)}}, {}, onUpdate);
            async.parallel(parallel_tasks, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
}

function updateMatch(elt, commentary, callback)
{
    var onConnect = function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            var collection = db.collection(collectionName);
            var doc = {
                "_id": elt._id
            };
            var onUpdate = function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else if (document)
                {
                    db.close();
                    callback(null, document);
                }
                else
                {
                    callback(true, null);
                }
            };
            collection.findAndModify(doc, [], {$set: {'commentary': commentary}}, {}, onUpdate)
        }
    };
    MongoClient.connect(mongoUri, onConnect);
}
