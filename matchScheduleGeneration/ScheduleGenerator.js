/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 10/8/14.
 */
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
var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}
var day1 = require("./Day1.js");
var day2 = require("./Day2.js");
var day3 = require("./Day3.js");
var day4 = require("./Day4.js");
var day5 = require("./Day5.js");
var day6 = require("./Day6.js");
var day7 = require("./Day7.js");


day1.gen_schedule();
day2.gen_schedule();
day3.gen_schedule();
day4.gen_schedule();
day6.gen_schedule();
day5.gen_schedule();
day6.gen_schedule();
day7.gen_schedule();
