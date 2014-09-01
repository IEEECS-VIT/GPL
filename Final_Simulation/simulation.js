/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 2/9/14.
 */
var collectionName;
var today = new Date();



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

var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/GPL';


var users, collectionName, index = 0, toss_state, delivery_score, batsman_performance_index, current_bowler, bowler_performance_index, previous_bowler, toss, i, j, strike_index, continuous_maximums, fall_of_wicket, winner_index;
var commentary = '', dismissed = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], five_wicket_haul = [0, 0, 0, 0, 0, 0], free_hit = 0, previous_partnership_index = -1, current_partnership_index = 0, partnership_balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], partnership_runs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], continuous_wickets = [0, 0, 0, 0, 0, 0], milestone = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], previous_dismissal = -1, extras = 0, maidens = [0, 0, 0, 0, 0, 0], previous_batsman = -1, score = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], balls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], fours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], maximums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], strike = [0, 1], deliveries = [0, 0, 0, 0, 0, 0], runs_conceded = [0, 0, 0, 0, 0, 0], wickets_taken = [0, 0, 0, 0, 0, 0], Total = [0, 0], previous_over = 0, wickets = [0, 0], Overs = [0, 0];
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
            collection.find({"_id":1}).toArray(callback);
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
    console.log(team2);

    //team_object[0] = new make(team1);
    team_object[1] = new make(team2);
    //console.log(team_object[0]);
    console.log(team_object[1]);
    users = [user1, user2];
};


function make(team)
{
    var i;
    Overs[0] = Overs[1] = 0;
    this.bat_rating = [];
    this.bat_average = [];
    this.bat_strike_rate = [];
    this.bowler_rating = [];
    this.bowl_average = [];
    this.bowl_strike_rate = [];
    this.wickets_taken = parseInt(team.wickets_taken);          // what is this value?
    this.coach_rating = parseInt(team[11]['Rating (15)']);
    console.log(this.coach_rating);
    this.economy = [];
    this.bowl_name = [];
    this.bat_name = [];
    var batsman_count= 0,bowler_count=0;
    for (i = 0; i < 11; ++i)
    {
        switch (team[i].Type)
        {
            case 'bat':
                this.bat_average[batsman_count] = parseFloat(team[i].Average);
                this.bat_strike_rate[batsman_count] = parseFloat(team[i]['Strike Rate']);
                this.bat_rating[batsman_count] = parseInt(team[i]['Rating (900)']);
                this.bat_name[batsman_count] = team[i]['Name'];
                //Overs[0] += this.bat_rating[batsman_count] / 11;
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
                //Overs[1] += this.bowler_rating[bowler_count] / 6;
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
                this.bowl_name[bowler_count] =  team[i]['Name'];
                this.bat_name[batsman_count] =   team[i]['Name'];
                //Overs[0] += this.bowler_rating[bowler_count] / 11;
                //Overs[1] += this.bowler_rating[bowler_count] / 6;
                batsman_count++;
                bowler_count++;
                break;
        }

    }
    /*for (i = 0; i < 11; ++i)
    {
        if (i < 6)
        {
            this.bowler_rating[i] += this.bowler_rating[i] / 5 - Overs[1] / 5 + this.coach_rating;
        }
        this.bat_rating[i] += this.bat_rating[i] / 10 - Overs[0] / 10 + this.coach_rating;
    }*/
}