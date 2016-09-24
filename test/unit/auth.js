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

// var assert = require("assert");

describe("Authentication tests:", function () {
	describe("Forget related actions:", function () {
		it("should work correctly for forgot user");

		it("should work correctly for forgot password");
	});

	describe("Login actions:", function () {
		it("should work correctly for social login");

		it("should work correctly for local login");

		it("should work correctly for admin login");
	});

	describe("Registration checks:", function () {
		it("should work correctly for social registation");

		it("should work correctly for local registration");
	});

	describe("Logout checks:", function () {
		it("should un-authenticate an admin correctly");

		it("should unauthenticate a regular user correctly");
	});
});
