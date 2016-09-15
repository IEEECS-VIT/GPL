const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const fs = require('fs');

let options = {
  auth: {
    api_key: process.env.SENDGRID_KEY
  }
};

let client = nodemailer.createTransport(sgTransport(options));
let template = fs.readFileSync(__dirname+'/templates/interest.html','utf-8');
let email = {
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
