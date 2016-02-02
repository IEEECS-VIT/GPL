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

describe('Simulation tests', function(){
    describe('simulation trigger', function(){
        /*
            TODO: Check for database, match day and user collection parameter validity
            TODO: Check for email worker status
            TODO: Ensure that simulation trigger does not crash.
        */
    });

    describe('simulation completion', function(){
        /*
            TODO: Ensure that simulation terminates without exceptions
            TODO: Parse data for update queries
        */
    });

    describe('simulation status update', function(){
        /*
            TODO: Collect data from slave simulation-controller callbacks
            TODO: Check for successful completion of update queries
            TODO: Pass to master callback
        */
    });

    describe('simulation emails', function(){
        /*
            TODO: Check for duplicate emails and invalid entries
            TODO: Send emails, log failures.
        */
    });
});
