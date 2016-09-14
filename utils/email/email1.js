var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var fs = require('fs');

var options = {
  auth: {
    api_key: process.env.SENDGRID_KEY
  }
}

var client = nodemailer.createTransport(sgTransport(options));
var template = fs.readFileSync(__dirname+'/templates/interest.html','utf-8');
var email = {
  from: 'gpl@ieeecsvit.com',
  to: 'vishwajeetsinhjadeja4@gmail.com',
  subject: 'Thank You For Showing Interest in GPL!',
  html: template
};

client.sendMail(email, function(err, info){
    if (err ){
      console.log(error);
    }
    else {
      console.log('Message sent: ' + info.response);
    }
});
