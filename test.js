var email   = require("emailjs");
var server  = email.server.connect({
    user:       "gravitaspremierleague@gmail.com",
    password: process.env.KEY,
    host:       "smtp.gmail.com",
    ssl:        true
});

// create the message
var message = email.message.create({
    from:       "gravitaspremierleague@gmail.com",
    subject:    "testing emailjs"
});
// attach an alternative html email for those with advanced email clients
message.attach_alternative("<table background='http://res.cloudinary.com/gpl/image/upload/general/img8.jpg' align='center' cellpadding='0' cellspacing='0' width='600' style='box-shadow: 5px 5px 15px #888888; border-radius: 12px; background-position: center; border-collapse: collapse;'>" +
    "<tr><td align='center' style='font-family:Lucida Sans Unicode; font-size:50px; padding: 40px 0 40px 0;color: #ffd195;'>graVITas Premier League</td>" +
    "</tr><tr><td align='center' style='padding: 5px 30px 40px 30px;font-family: Arial; line-height:30px; font-size:x-large;'> Thank you for your interest in graVITas Premier League <br>" +
    "Please check out  our Facebook <a href='http://www.facebook.com/gravitaspremierleague' style='text-decoration: none;'>page</a> to stay close to all the action! </td>" +
    "</tr><tr><td align='left' style='padding: 20px 20px 20px 20px; font-family: courier; font-size: large;color: #ffd195; font-weight: bold;'>Regards:<br>Team GPL<br>IEEE Computer Society</td></tr></table>");
message.header.to = 'kunal.nagpal2012@vit.ac.in';
server.send(message, function(err, message) {
    if(err)
    {
        console.log(err.message);
    }
    else
    {
        //console.log(message);
    }
});
//exports.send = server.send;
//exports.wrap = email.message.create;