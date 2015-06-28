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

module.exports = {
    _id: '',
    dob: '',
    team_no: '',
    manager_name: '',
    email: '',
    phone: '',
    squad: [],
    team: [],
    win: 0,
    loss: 0,
    tied: 0,
    played: 0,
    points: 0,
    ratio: 0.0,
    runs_for: 0,
    runs_against: 0,
    balls_for: 0,
    balls_against: 0,
    net_run_rate: 0.0,
    wickets_taken: 0,
    wickets_lost: 0,
    strategy: '',
    toss: 0,
    form: 1,
    morale: 0.0,
    streak: 0,
    all_outs: 0,
    avg_runs_for: 0.0,
    avg_runs_against: 0.0,
    avg_wickets_lost: 0.0,
    avg_wickets_taken: 0.0,
    avg_overs_for: 0.0,
    avg_overs_against: 0.0,
    highest_total: -1,
    lowest_total: Number.MAX_VALUE,
    stats: {},
    surplus: 0
};