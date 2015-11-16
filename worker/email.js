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

var ref =
{
    'users': 1,
    'round2': 2,
    'round3': 3
};
var email = require("emailjs");
var server = email.server.connect({
    user: "gravitaspremierleague@gmail.com",
    password: process.env.KEY,
    host: "smtp.gmail.com",
    ssl: true
});
var version = (new Date).getFullYear() - 2013;

exports.send = function (message, callback)
{
    server.send(message, callback);
};

exports.wrap = function (content)
{
    return email.message.create(content);
};

exports.message = exports.wrap({from: 'gravitaspremierleague@gmail.com'});

exports.match = exports.wrap({
    from: 'gravitaspremierleague@gmail.com',
    subject: 'Round ' + ref[process.env.MATCH] + 'Match ' + process.env.DAY + ', results are out!'
}).attach_alternative(
"<table background='http://res.cloudinary.com/gpl/general/img7.jpg' align='center' cellpadding='0' cellspacing='0' " +
    "width='600' style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
        "<tr>" +
            "<td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>" +
                "graVITas Premier League" +
            "</td>" +
        "</tr>" +
        "<tr>" +
            "<td align='center' style='padding: 40px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:x-large;'>" +
                "This is to inform that the match results are out<br>Please click " +
                "<a href='http://gravitaspremierleague.com/home/matches' style='text-decoration: none;'>" +
                    "here" +
                "</a>" +
                " to view your scores." +
            "</td>" +
        "</tr>" +
        "<tr>" +
            "<td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195;" +
                "font-weight: bold;'>" +
                "Regards,<br>" +
                "Team GPL<br>" +
                "IEEE Computer Society<br>" +
                "VIT Student chapter" +
            "</td>" +
        "</tr>" +
"</table>");


exports.interest = exports.wrap({
    from: 'gravitaspremierleague@gmail.com',
    subject: 'graVITas Premier League v' + version + '.0, graVITas ' + (version + 2013)
}).attach_alternative(
"<table background='http://res.cloudinary.com/gpl/general/img0.jpg' align='center' cellpadding='0' cellspacing='0' width='600'" +
    " style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
    "<tr>" +
        "<td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>" +
            "graVITas Premier League" +
        "</td>" +
    "</tr>" +
    "<tr>" +
        "<td align='center' style='padding: 5px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:x-large;'>" +
            " Thank you for your interest in graVITas Premier League <br>" +
            "Please check out  our Facebook <a href='http://www.facebook.com/gravitaspremierleague' style='text-decoration: none;'>" +
            "page</a> to stay close to all the action!" +
        "</td>" +
    "</tr>" +
    "<tr>" +
        "<td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; " +
"           font-weight: bold;'>" +
            "Regards,<br>" +
            "Team GPL,<br>" +
            "IEEE Computer Society<br>" +
            "VIT student chapter" +
        "</td>" +
    "</tr>" +
"</table>");

exports.register = exports.wrap({
    'from': 'gravitaspremierleague@gmail.com',
    subject: 'Welcome to G.P.L ' + version + '.0!'
}).attach_alternative(
"<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Strict//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'>" +
"<html xmlns='http://www.w3.org/1999/xhtml' xmlns='http://www.w3.org/1999/xhtml'>" +
    "<head>" +
        "<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" +
        "<meta name='viewport' content='width=device-width' />" +
    "</head>" +
    "<body style='width: 100% !important; min-width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; " +
            "color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; text-align: left; " +
            "line-height: 19px; font-size: 14px; margin: 0; padding: 0;'>" +
        "<table class='body' style='border-spacing: 0; border-collapse: collapse; vertical-align: top; text-align: left;" +
                " height: 100%; width: 100%; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal;" +
                " line-height: 19px; font-size: 14px; margin: 0; padding: 0;'>" +
            "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                "<td class='center' align='center' valign='top' style='word-break: break-word; -webkit-hyphens: auto; " +
                "-moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top; text-align: center;" +
                " color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px;" +
                " font-size: 14px; margin: 0; padding: 0;'>" +
                    "<center style='width: 100%; min-width: 580px;'>" +
                        "<table class='row header' style='border-spacing: 0; border-collapse: collapse; vertical-align: top;" +
                            " text-align: left; width: 100%; position: relative; background: #0D5B67; padding: 0px;' " +
                            "bgcolor='#0D5B67'>" +
                            "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                                "<td class='center' align='center' style='word-break: break-word; -webkit-hyphens: auto;" +
                                " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important; vertical-align: top;" +
                                " text-align: center; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif; " +
                                "font-weight: normal; line-height: 19px; font-size: 14px; margin: 0; padding: 0;' valign='top'>" +
                                    "<center style='width: 100%; min-width: 580px;'>" +
                                        "<table class='container' style='border-spacing: 0; border-collapse: collapse; " +
                                            "vertical-align: top; text-align: inherit; width: 580px; margin: 0 auto; " +
                                                "padding: 0;'>" +
                                            "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                                                "<td class='wrapper last' style='word-break: break-word; -webkit-hyphens: auto;" +
                                                    " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                    " vertical-align: top; text-align: left; position: relative; color: #222222;" +
                                                    " font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal;" +
                                                    " line-height: 19px; font-size: 14px; margin: 0; padding: 10px 0 0'" +
                                                    " align='left' valign='top'>" +
                                                    "<table class='twelve columns' style='border-spacing: 0; border-collapse: collapse;" +
                                                        " vertical-align: top; text-align: left; width: 580px; margin: 0 auto;" +
                                                        " padding: 0;'>" +
                                                        "<tr style='vertical-align: top; text-align: left; padding: 0;' " +
                                                            "align='left'>" +
                                                            "<td class='six sub-columns' style='word-break: break-word;" +
                                                                " -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto;" +
                                                                " border-collapse: collapse !important; vertical-align: top;" +
                                                                " text-align: left; min-width: 0; width: 50%; color: #222222;" +
                                                                " font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal;" +
                                                                " line-height: 19px; font-size: 14px; margin: 0; padding: 0 10px 10px 0;'" +
                                                                " align='left' valign='top'>" +
                                                                "<img src='http://res.cloudinary.com/gpl/general/gpllogo.png'" +
                                                                    " height='50' style='outline: none; text-decoration: none;" +
                                                                    " -ms-interpolation-mode: bicubic; width: auto; max-width: 100%;" +
                                                                    " float: left; clear: both; display: block;' align='left' />" +
                                                            "</td>" +
                                                            "<td class='six sub-columns last' style='text-align: right;" +
                                                                " vertical-align: middle; word-break: break-word; -webkit-hyphens: auto;" +
                                                                " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                                " min-width: 0; width: 50%; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                                " font-weight: normal; line-height: 19px; font-size: 14px;" +
                                                                " margin: 0; padding: 0px 0px 10px;' align='right' valign='middle'>" +
                                                                "<span class='template-label' style='color: #ffffff; " +
                                                                "font-weight: bold; font-size: 11px;'>" +
                                                                    "Gravitas Premier League" +
                                                                "</span>" +
                                                            "</td>" +
                                                            "<td class='expander' style='word-break: break-word; -webkit-hyphens: auto;" +
                                                                " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                                " vertical-align: top; text-align: left; visibility: hidden;" +
                                                                " width: 0; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                                " font-weight: normal; line-height: 19px; font-size: 14px;" +
                                                                " margin: 0; padding: 0;' align='left' valign='top'>" +
                                                            "</td>" +
                                                        "</tr>" +
                                                    "</table>" +
                                                "</td>" +
                                            "</tr>" +
                                        "</table>" +
                                    "</center>" +
                                "</td>" +
                            "</tr>" +
                        "</table>" +
                        "<table class='container' style='border-spacing: 0; border-collapse: collapse; vertical-align: top;" +
                            " text-align: inherit; width: 580px; margin: 0 auto; padding: 0;'>" +
                            "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                                "<td style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto; hyphens: auto;" +
                                    " border-collapse: collapse !important; vertical-align: top; text-align: left; color: #222222;" +
                                    " font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px;" +
                                    " font-size: 14px; margin: 0; padding: 0;' align='left' valign='top'>" +
                                    "<table class='row' style='border-spacing: 0; border-collapse: collapse; vertical-align: top;" +
                                        " text-align: left; width: 100%; position: relative; display: block; padding: 0px;'>" +
                                        "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                                            "<td class='wrapper last' style='word-break: break-word; -webkit-hyphens: auto;" +
                                                " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                " vertical-align: top; text-align: left; position: relative; color: #222222;" +
                                                " font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; " +
                                                "line-height: 19px; font-size: 14px; margin: 0; padding: 10px 0px 0px;' " +
                                                "align='left' valign='top'>" +
                                                "<table class='twelve columns' style='border-spacing: 0; border-collapse: collapse;" +
                                                    " vertical-align: top; text-align: left; width: 580px; margin: 0 auto;" +
                                                    " padding: 0;'>" +
                                                    "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                                                        "<td style='word-break: break-word; -webkit-hyphens: auto; -moz-hyphens: auto;" +
                                                            " hyphens: auto; border-collapse: collapse !important; vertical-align: top;" +
                                                            " text-align: left; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                            " font-weight: normal; line-height: 19px; font-size: 14px; margin: 0;" +
                                                            " padding: 0px 0px 10px;' align='left' valign='top'>" +
                                                            "<h1 style='color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                                " font-weight: normal; text-align: left; line-height: 1.3;" +
                                                                " word-break: normal; font-size: 40px; margin: 0; padding: 0;'" +
                                                                " align='left'>" +
                                                                "Hi," +
                                                            "</h1>" +
                                                            "<p class='lead' style='color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                                " font-weight: normal; text-align: left; line-height: 21px;" +
                                                                " font-size: 18px; margin: 0 0 10px; padding: 0;' align='left'>" +
                                                                "This is to inform that that you have successfully registered for Gravitas Premier League 2.0." +
                                                            "</p>" +
                                                            "<p style='color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                                " font-weight: normal; text-align: left; line-height: 19px;" +
                                                                " font-size: 14px; margin: 0 0 10px; padding: 0;' align='left'>" +
                                                                "<a href='http://gravitaspremierleague.com/' style='color: #2ba6cb;" +
                                                                    " text-decoration: none;'>" +
                                                                    "Click here" +
                                                                "</a> for more details. <br />" +
                                                                "Good luck! <br />" +
                                                                "<br />" +
                                                                "Regards<br />" +
                                                                "Team GPL,<br />" +
                                                                "IEEE Computer Society,<br />" +
                                                                "VIT Student Chapter" +
                                                            "</p>" +
                                                        "</td>" +
                                                        "<td class='expander' style='word-break: break-word; -webkit-hyphens: auto;" +
                                                            " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                            " vertical-align: top; text-align: left; visibility: hidden; width: 0px;" +
                                                            " color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                            " font-weight: normal; line-height: 19px; font-size: 14px; " +
                                                            "margin: 0; padding: 0;' align='left' valign='top'>" +
                                                        "</td>" +
                                                    "</tr>" +
                                                "</table>" +
                                            "</td>" +
                                        "</tr>" +
                                    "</table>" +
                                    "<table class='row footer' style='border-spacing: 0; border-collapse: collapse; " +
                                        "vertical-align: top; text-align: left; width: 100%; position: relative; " +
                                        "display: block; padding: 0px;'>" +
                                        "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                                            "<td class='wrapper' style='word-break: break-word; -webkit-hyphens: auto; " +
                                                "-moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                " vertical-align: top; text-align: left; position: relative; color: #222222;" +
                                                " font-family: 'Helvetica', 'Arial', sans-serif; font-weight: normal; " +
                                                "line-height: 19px; font-size: 14px; background: #ebebeb; margin: 0; " +
                                                "padding: 10px 20px 0px 0px;' align='left' bgcolor='#ebebeb' valign='top'>" +
                                                "<table class='six columns' style='border-spacing: 0; border-collapse: collapse;" +
                                                    " vertical-align: top; text-align: left; width: 280px; margin: 0 auto;" +
                                                    " padding: 0;'>" +
                                                    "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                                                        "<td class='left-text-pad' style='word-break: break-word; -webkit-hyphens: auto;" +
                                                        " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                        " vertical-align: top; text-align: left; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                        " font-weight: normal; line-height: 19px; font-size: 14px; margin: 0;" +
                                                        " padding: 0px 0px 10px 10px;' align='left' valign='top'>" +
                                                            "<h5 style='color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                                " font-weight: normal; text-align: left; line-height: 1.3;" +
                                                                " word-break: normal; font-size: 24px; margin: 0; padding: 0 0 10px;'" +
                                                                " align='left'>" +
                                                                "Connect With Us:" +
                                                            "</h5>" +
                                                            "<table class='tiny-button facebook' style='border-spacing: 0;" +
                                                                " border-collapse: collapse; vertical-align: top; text-align: left;" +
                                                                " width: 100%; overflow: hidden; padding: 0;'>" +
                                                                "<tr style='vertical-align: top; text-align: left; padding: 0;'" +
                                                                    " align='left'>" +
                                                                    "<td style='word-break: break-word; -webkit-hyphens: auto;" +
                                                                        " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                                        " vertical-align: top; text-align: center; color: #ffffff;" +
                                                                        " font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                                        " font-weight: normal; line-height: 19px; font-size: 14px;" +
                                                                        " display: block; width: auto !important; background: #3b5998;" +
                                                                        " margin: 0; padding: 5px 0 4px; border: 1px solid #2d4473;'" +
                                                                        " align='center' bgcolor='#3b5998' valign='top'>" +
                                                                        "<a href='https://www.facebook.com/gravitaspremierleague'" +
                                                                            " style='color: #ffffff; text-decoration: none;" +
                                                                            " font-weight: normal; font-family: Helvetica, Arial, sans-serif;" +
                                                                            " font-size: 12px;'>" +
                                                                            "Facebook" +
                                                                        "</a>" +
                                                                    "</td>" +
                                                                "</tr>" +
                                                            "</table>" +
                                                            "<br />" +
                                                            "<table class='tiny-button twitter' style='border-spacing: 0;" +
                                                                    " border-collapse: collapse; vertical-align: top; " +
                                                                    "text-align: left; width: 100%; overflow: hidden; padding: 0;'>" +
                                                                "<tr style='vertical-align: top; text-align: left; padding: 0;' align='left'>" +
                                                                    "<td style='word-break: break-word; -webkit-hyphens: auto;" +
                                                                        " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                                        " vertical-align: top; text-align: center; " +
                                                                        "color: #ffffff; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                                        " font-weight: normal; line-height: 19px; font-size: 14px;" +
                                                                        " display: block; width: auto !important; background: #00acee;" +
                                                                        " margin: 0; padding: 5px 0 4px; border: 1px solid #0087bb;'" +
                                                                        " align='center' bgcolor='#00acee' valign='top'>" +
                                                                        "<a href='https://twitter.com/graVITasgpl' " +
                                                                            "style='color: #ffffff; text-decoration: none;" +
                                                                            " font-weight: normal; font-family: Helvetica, Arial, sans-serif;" +
                                                                            " font-size: 12px;'>" +
                                                                                "Twitter" +
                                                                        "</a>" +
                                                                    "</td>" +
                                                                "</tr>" +
                                                            "</table>" +
                                                            "<br />" +
                                                        "</td>" +
                                                        "<td class='expander' style='word-break: break-word; -webkit-hyphens: auto;" +
                                                            " -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !important;" +
                                                            " vertical-align: top; text-align: left; visibility: hidden;" +
                                                            " width: 0px; color: #222222; font-family: 'Helvetica', 'Arial', sans-serif;" +
                                                            " font-weight: normal; line-height: 19px; font-size: 14px; " +
                                                            "margin: 0; padding: 0;' align='left' valign='top'>" +
                                                        "</td>" +
                                                    "</tr>" +
                                                "</table>" +
                                            "</td>" +
                                        "</tr>" +
                                    "</table>" +
                                    "<!-- container end below -->" +
                                "</td>" +
                            "</tr>" +
                        "</table>" +
                    "</center>" +
                "</td>" +
            "</tr>" +
        "</table>" +
    "</body>" +
"</html>");