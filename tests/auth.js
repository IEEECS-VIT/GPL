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

describe('Authentication tests', function(){
    describe('Forget related actions', function(){
        it('Forgot user', function(){
        /*
            TODO: forgot user request
            TODO: forgot user request validation
            TODO: details compilation
            TODO: email send check
            TODO: update request count in stats collection
         */
        });

        it('Forgot password', function(){
        /*
            TODO: forgot password request
            TODO: request validation: Check for accidental requests by social users
            TODO: password reset token generation
            TODO: user record update
            TODO: Reset token email check
            TODO: token verification
            TODO: Password hash update
            TODO: Confirmation email check
            TODO: update request count in stats collection
        */
        });
    });

    describe('Login actions', function(){
        it('Social login checks', function(){
        /*
            TODO: login request
            TODO: accepting team detail(s)
            TODO: platform selection
            TODO: backend checks
            TODO: token confirmation and cookie instantiation
        */
        });

        it('Local login checks', function(){
        /*
            TODO: login request
            TODO: accepting team detail(s)
            TODO: record confirmation and cookie instantiation
        */
        });

        it('Admin login checks', function(){
        /*
            TODO: login request
            TODO: record confirmation and cookie instantiation
        */
        });
    });

    describe('Registration checks', function(){
        it('Social registration checks', function(){
        /*
            TODO: accepting user details
            TODO: Selecting platform
            TODO: Awaiting platform authentication token
            TODO: Team existence check
            TODO: user record fetch / create operation
            TODO: redirect to players selection route
            TODO: Confirmation email check
        */
        });

        it('Local registration checks', function(){
        /*
            TODO: accepting user details
            TODO: Team existence check
            TODO: user record fetch / create operation
            TODO: redirect to players selection route
            TODO: Confirmation email check
        */
        });
    });

    describe('Logout checks', function(){
        it('Admin logout', function(){
        /*
            TODO: Check if admin signedCookie exists and destroy it
            TODO: Redirect to login page.
        */
        });

        it('User logout', function(){
        /*
            TODO: Check if name signedCookie exists and destroy it.
            TODO: Redirect to login page.
        */
        });
    });
});
