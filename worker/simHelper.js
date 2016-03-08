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

var ref =
{
    bat: 'bowl',
    bowl: 'bat'
};
var MoM =
{
    id: '',
    team: '',
    points: 0
};

exports.rand = function (base, limit)
{
    if (limit)
    {
        return base + ((limit > base) ? rand(limit - base) : 0);
    }
    else if (base)
    {
        return ((typeof(base) === 'object') ? base[rand(base.length)] : parseInt(Math.random() * 1000000000000000, 10) % base);
    }
    else
    {
        return Math.random();
    }
};

exports.Make = function (team)
{
    var temp = 0;
    var teamArray = [{}, {}];
    
    for(i = 0; i < 2; ++i)
    {
        teamArray[i].name = [];
        teamArray[i].type = [];
        teamArray[i].batAvg = [];
        teamArray[i].economy = [];
        teamArray[i].bowlAvg = [];
        teamArray[i].batRating = [];
        teamArray[i].meanRating = 0;
        teamArray[i].bowlRating = [];
        teamArray[i].avgBatRating = 0;
        teamArray[i].avgBowlRating = 0;
        teamArray[i].batStrikeRate = [];
        teamArray[i].bowlStrikeRate = [];
        teamArray[i].coachRating = team[11].Rating || -50;

        for (j = 0; j < 11; ++j)
        {
            teamArray[i].name.push(team[i][j].Name);
            teamArray[i].batAvg.push(team[i][j].Average);
            teamArray[i].type.push(` (${team[i][j].Type})`);
            teamArray[i].bowlAvg.push(team[i][j].Avg || 30);
            teamArray[i].economy.push(team[i][j].Economy || 10);
            teamArray[i].bowlStrikeRate.push(team[i][j].SR || 40);
            teamArray[i].batStrikeRate.push(team[i][j]['Strike Rate']);

            if(team[i][j].Rating)
            {
                teamArray[i][`${team[i][j].Type}Rating`] = team[i][j].Rating;
                teamArray[i][`${ref[team[i][j].Type]}Rating`] = 900 - team[i][j].Rating;

                if(team[i][j].Rating > temp)
                {
                    MoM.team = i;
                    temp = team[i][j].Rating;
                    MoM.id = team[i][j]._id;
                }
            }
            else
            {
                teamArray[i].batRating.push(team[i][j].Bat);
                teamArray[i].bowlRating.push(team[i][j].Bowl);

                if(team[i][j].Bat > temp)
                {
                    MoM.team = i;
                    temp = team[i][j].Bat;
                    MoM.id = team[i][j]._id;
                }
                if(team[i][j].Bowl > temp)
                {
                    MoM.team = i;
                    temp = team[i][j].Bowl;
                    MoM.id = team[i][j]._id;
                }
            }

            teamArray[i].avgBatRating += teamArray[i].batRating[j];
            teamArray[i].avgBowlRating += teamArray[i].bowlRating[j];
        }

        for (j = 0; j < 11; ++j)
        {
            teamArray[i].batRating[j] += parseFloat(teamArray[i].batRating[j]) / (10) - parseFloat(teamArray[i].avgBatRating) / (110) + parseInt(teamArray[i].coachRating, 10);
            teamArray[i].bowlRating[j] += parseFloat(teamArray[i].bowlRating[j]) / (10) - parseFloat(teamArray[i].avgBowlRating) / (110) + parseInt(teamArray[i].coachRating, 10);
            teamArray[i].batRating[j] = (teamArray[i].batRating[j] < 0) ? ((teamArray[i].coachRating < 0) ? (0) : (teamArray[i].coachRating)) : (teamArray[i].batRating[j]);
            teamArray[i].bowlRating[j] = (teamArray[i].bowlRating[j] < 0) ? ((teamArray[i].coachRating < 0) ? (0) : (teamArray[i].coachRating)) : (teamArray[i].bowlRating[j]);
            teamArray[i].meanRating += teamArray[i].bowlRating[j] + teamArray[i].batRating[j];
        }

        teamArray[i].meanRating /= 22;
        delete teamArray[i].avgBatRating;
        delete teamArray[i].avgBowlRating;
    }

    return {
        teams: teamArray,
        MoM: MoM
    };
};

exports.checkMoM = function()
{

};