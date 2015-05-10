/*
 Created by Kunal Nagpal on 08-11-2014.
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

 Change the collection name just once here. All other dependencies are adjusted automatically.
 Dependencies:
 db: mongo-team(64, 100), mongo-users(41, 71, 100, 144, 199, 239, 268, 298, 328)
 matchScheduleGeneration: Day1-7(41)
 worker: simulation-controller(95,102)
*/
module.exports = process.env.MATCH || 'round3';
