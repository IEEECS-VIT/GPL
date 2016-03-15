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

describe('User functionality tests:', function(){
    // check for user authentication before tests
    before(function(){

    });

    it('Admin tasks', function(){
    /*
        team stats: team count, authentication patterns
        database status report
    */
    });

    it('Home page checks', function(){
    /*
        Team details check
        Squad details check
        Team stats
        Player stats
        image fetch checks
    */
    });

    it('Player selection checks', function(){
    /*
        check for user authentication
        check for player information structure
    */
    });

    it('Squad update checks', function(){
    /*
        Evaluate squad status
        update user records
    */
    });

    it('Feature suggestion checks', function(){
    /*
        update feature collection
    */
    });

    it('User interest check', function(){
    /*
        check for successful user interest record creation
    */
    });


    it('Game stats checks', function(){
    /*
        ensure that the collective game stats are fetched correctly
        convert balls to overs -> 119 ~ 19.5
        pass values through middleware
    */
    });

    it('Leaderboard checks', function(){
    /*
        fetch leaderboard from user collection
        identify location index of the current user
        if position is outside the top 10, append user record to the leaderboard array
        dump leaderboard object to callback
    */
    });

    it('Dashboard checks', function(){
    /*
        fetch dashboard from user collection
        Process object to retain useful data
        dump dashboard object to callback
    */
    });

    it('Match detail checks', function(){
    /*
        parse request parameter day and validate if it falls within [1, 7]
        fetch details for the corresponding day
        dump to view via callback
    */
    });

    it('Setting checks', function(){
    /*
        check that page renders correctly
        mock requests with valid and bogus origin headers, act accordingly
        update settings in the user record
    */
    });
});
