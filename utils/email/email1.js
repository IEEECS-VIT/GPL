const join = require("path").join,
	nodemailer = require("nodemailer"),
	sgTransport = require("nodemailer-sendgrid-transport"),
	fs = require("fs");

let options = {
		auth: {
			api_key: process.env.SENDGRID_KEY // eslint-disable-line camelcase
		}
	},
	client = nodemailer.createTransport(sgTransport(options)),
	template = fs.readFileSync(join(__dirname, "templates", "interest.html"), "utf-8"), // eslint-disable-line no-sync
	email = {
		from: "gpl@ieeecsvit.com",
		to: "vishwajeetsinhjadeja4@gmail.com",
		subject: "Thank You For Showing Interest in GPL!",
		html: template
	};

client.sendMail(email, function (err, info) {
	if (err) {
		console.log(err);
	}
	else {
		console.log(`Message sent: ${info.response}`);
	}
});
