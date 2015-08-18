var email   = require("emailjs");
var server  = email.server.connect({
    user:       "gravitaspremierleague@gmail.com",
    password: process.env.KEY,
    host:       "smtp.gmail.com",
    ssl:        true
});

exports.send = function(message, callback) {
    server.send(message, callback);
};
exports.wrap = function(content)
{
    return email.message.create(content);
};