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

var assert = require("assert");

describe("Authentication tests:", function(){
    describe("Forget related actions:", function(){
        it("Forgot user", function(){
            /*
                forgot user request
                forgot user request validation
                details compilation
                email send check
                update request count in stats collection
             */
        });

        it("Forgot password", function(){
        /*
            forgot password request
            request validation: Check for accidental requests by social users
            password reset token generation
            user record update
            Reset token email check
            token verification
            Password hash update
            Confirmation email check
            update request count in stats collection
        */
        });
    });

    describe("Login actions:", function(){
        it("Social login checks", function(){
        /*
            login request
            accepting team detail(s)
            platform selection
            backend checks
            token confirmation and cookie instantiation
        */
        });

        it("Local login checks", function(){
        /*
            login request
            accepting team detail(s)
            record confirmation and cookie instantiation
        */
        });

        it("Admin login checks", function(){
        /*
            login request
            record confirmation and cookie instantiation
        */
        });
    });

    describe("Registration checks:", function(){
        it("Social registration checks", function(){
        /*
            accepting user details
            Selecting platform
            Awaiting platform authentication token
            Team existence check
            user record fetch / create operation
            redirect to players selection route
            Confirmation email check
        */
        });

        it("Local registration checks", function(){
        /*
            accepting user details
            Team existence check
            user record fetch / create operation
            redirect to players selection route
            Confirmation email check
        */
        });
    });

    describe("Logout checks:", function(){
        it("Admin logout", function(){
        /*
            Check if admin signedCookie exists and destroy it
            Redirect to login page.
        */
        });

        it("User logout", function(){
        /*
            Check if name signedCookie exists and destroy it.
            Redirect to login page.
        */
        });
    });
});
