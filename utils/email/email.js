/*
 *  GraVITas Premier League <gpl@ieeecsvit.com>
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

const email = require("emailjs");
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const read = require('fs').readFileSync; // the synchronous version has been used here as email template creation happens only once, during application startup.
const path = require('path').join;

let options = {
	auth: {
		api_key: process.env.SENDGRID_KEY
	}
};

let ref =
{
	'users': 1,
	'round2': 2,
	'round3': 3
};

let client = nodemailer.createTransport(sgTransport(options));

let version = (new Date).getFullYear() - 2013;
let user = read(path(__dirname, 'templates', 'user.html'), 'utf-8');
let reset = read(path(__dirname, 'templates', 'reset.html'), 'utf-8');
let password = read(path(__dirname, 'templates', 'password.html'), 'utf-8');

exports.send = function (message, callback)
{
    let mail = {
        sender: 'graVITas Premier League <' + message.header.from + '>',
        to: message.header.to,
        subject: message.header.subject,
    };
    mail.html = message.alternative.data;
    client.sendMail(mail, callback);
};

exports.wrap = function (content)
{
    return email.message.create(content);
};

exports.message = exports.wrap({from: 'gpl@ieeecsvit.com'});

exports.match = exports.wrap({
    "from": 'gpl@ieeecsvit.com',
    "subject": `Round ${ref[process.env.MATCH]}, Match ${process.env.DAY} results are out!`
}).attach_alternative(read(path(__dirname, 'templates', 'match.html')));


exports.interest = exports.wrap({
    "from": 'gpl@ieeecsvit.com',
    "subject": 'graVITas Premier League v' + version + '.0, graVITas ' + (version + 2013)
}).attach_alternative(read(path(__dirname, 'templates', 'interest.html')));

exports.register = exports.wrap({
    "from": 'gpl@ieeecsvit.com',
    "subject": 'Welcome to G.P.L ' + version + '.0!'
}).attach_alternative(read(path(__dirname, 'templates', 'register.html')));

exports.user = function(teams)
{
    return user.replace('TEAMS', teams);
};

exports.password = function(host, token)
{
    return password.replace('URL', `${host}/reset/${token}`);
};

exports.reset = function(manager, team)
{
    return reset.replace('MANAGER', manager).replace('TEAM', team);
};
