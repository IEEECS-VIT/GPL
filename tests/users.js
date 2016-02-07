/*
 *  graVITas Premier League <gravitaspremierleague@gmail.com>
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

var assert = require('assert');

describe('User functionality tests', function(){
    // check for user authentication before tests
    before(function(){

    });

    it('Admin tasks', function(){
    /*
        TODO: team stats: team count, authentication patterns
        TODO: database status report
    */
    });

    it('Home page checks', function(){
    /*
        TODO: Team details check
        TODO: Squad details check
        TODO: Team stats
        TODO: Player stats
        TODO: image fetch checks
    */
    });

    it('Player selection checks', function(){
    /*
        TODO: check for user authentication
        TODO: check for player information structure
    */
    });

    it('Squad update checks', function(){
    /*
        TODO: Evaluate squad status
        TODO: update user records
    */
    });

    it('Feature suggestion checks', function(){
    /*
        TODO: update feature collection
    */
    });

    it('User interest check', function(){
    /*
        TODO: check for successful user interest record creation
    */
    });


    it('Game stats checks', function(){
    /*
        TODO: ensure that the collective game stats are fetched correctly
        TODO: convert balls to overs -> 119 ~ 19.5
        TODO: pass values through middleware
    */
    });

    it('Leaderboard checks', function(){
    /*
        TODO: fetch leaderboard from user collection
        TODO: identify location index of the current user
        TODO: if position is outside the top 10, append user record to the leaderboard array
        TODO: dump leaderboard object to callback
    */
    });

    it('Dashboard checks', function(){
    /*
        TODO: fetch dashboard from user collection
        TODO: Process object to retain useful data
        TODO: dump dashboard object to callback
    */
    });

    it('Match detail checks', function(){
    /*
        TODO: parse request parameter day and validate if it falls [1, 7]
        TODO: fetch details for the corresponding day
        TODO: dump to view via callback
    */
    });

    it('Setting checks', function(){
    /*
        TODO: check that page renders correctly
        TODO: mock requests with valid and bogus origin headers, act accordingly
        TODO: update settings in the user record
    */
    });
});
