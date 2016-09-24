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

console.time("Request");
console.time("Data stitching");
console.time("DOM construction");
console.time("Commentary compilation");
console.time("File update");

var dump,
	temp,
	index,
	data = "",
	flag = false,
	fs = require("fs"),
	http = require("http"),
	line = require("os").EOL,
	async = require("async"),
	path = require("path").join,
	scrape = require("cheerio").load,
	commentary = {
		"no run":
		{
			content: "",
			file: path(__dirname, "score", "dot2")
		},
		"1 run":
		{
			content: "",
			file: path(__dirname, "score", "one2")
		},
		"2 runs":
		{
			content: "",
			file: path(__dirname, "score", "two")
		},
		"3 runs":
		{
			content: "",
			file: path(__dirname, "score", "three")
		},
		FOUR:
		{
			content: "",
			file: path(__dirname, "score", "four")
		},
		SIX:
		{
			content: "",
			file: path(__dirname, "score", "six")
		},
		wide:
		{
			content: "",
			file: path(__dirname, "extra", "wide")
		},
		"no ball":
		{
			content: "",
			file: path(__dirname, "extra", "noBall")
		},
		cnb:
		{
			content: "",
			file: path(__dirname, "out", "cnb")
		},
		lbw:
		{
			content: "",
			file: path(__dirname, "out", "lbw")
		},
		caught:
		{
			content: "",
			file: path(__dirname, "out", "caught")
		},
		bowled:
		{
			content: "",
			file: path(__dirname, "out", "bowled")
		},
		stumped:
		{
			content: "",
			file: path(__dirname, "out", "stumped")
		},
		runout:
		{
			content: "",
			file: path(__dirname, "out", "runout")
		}
	},
	ref = ["FOUR", "SIX", "OUT"],
	opts = ["batsman", "batter", "striker"],
	append = (element) => { return `,\n\t\t"${element.replace(/"/g, "'")}"`; },
	rand = () => { return opts[parseInt((Math.random() * 1000000000000000) % 3, 10)]; },
	genericHandler = function (arg) {
		arg = (arg[0].data || "").replace(/\s$/, ".");
		index = arg.split(", ");
		temp = index[0].split(" to ");
		index[1] = index[1].replace(/^\d?\s?wides?$/, "wide");
		index[1] = index[1].replace(/^\d?\s?no balls?$/, "no ball");

		return [
			index[1],
			index.slice(2).join(", ").replace(temp[0], "the bowler").replace(temp[1], `the ${rand()}`)
		];
	},
	dismissalHandler = function (arg) {
		arg = arg[0].children[0].data;

		if (arg.indexOf(" c ") > -1) {
			arg = ["caught"];
		}
		else if (arg.indexOf(" lbw ") > -1) {
			arg = ["lbw"];
		}
		else if (arg.indexOf(" run out ") > -1) {
			arg = ["runout"];
		}
		else if (arg.indexOf(" st ") > -1) {
			arg = ["stumped"];
		}
		else if (arg.indexOf(" b ") > -1) {
			arg = ["bowled"];
		}
		else if (arg.indexOf(" cnb ") > -1) {
			arg = ["cnb"];
		}

		arg.push(temp);

		return arg;
	},
	specialHandler = function (arg) {
		temp = arg[0].data;
		temp = temp.slice(0, -2);
		temp = temp.split(" to ");
		arg[2] = arg[2].data;
		arg[1] = arg[1].children[0].data;

		if (ref.indexOf(arg[1]) < 0) {
			arg[2] = arg[2].replace(/\s$/, ".");
			temp.splice(1, 1, temp[1].split(", "));
			temp[0] = [temp[0], temp[1].shift()];
			arg[2] = arg[2].replace(new RegExp(temp[0][0], "g"), "the bowler");
			arg[2] = arg[2].replace(new RegExp(temp[0][1], "g"), `the ${rand()}`);
			arg = [temp[1][0], arg[1] + arg[2]];
		}
		else {
			arg[2] = arg[2].slice(2);
			arg[2] = arg[2].replace(/\s$/, ".");
			arg[2] = arg[2].replace(new RegExp(temp[0], "g"), "the bowler");
			arg[2] = arg[2].replace(new RegExp(temp[1], "g"), `the ${rand()}`);
			arg = [arg[1], arg[2]];
			flag = arg[0] === "OUT";
		}

		return arg;
	},
	processRef = {
		1:
		{
			true: dismissalHandler,
			false: genericHandler
		},
		3:
		{
			false: specialHandler
		}
	},
	processor = function (arg, callback) {
		arg = processRef[arg.children.length][flag](arg.children);

		if (flag) {
			if (arg[0] === "OUT") {
				temp = arg[1];
			}
			else {
				commentary[arg[0]].content += append(arg[1]);
				flag = false;
			}
		}
		else if (commentary[arg[0]]) {
			commentary[arg[0]].content += append(arg[1]);
		}

		callback(null);
	},
	updateFile = function (arg, callback) {
		if (commentary[arg].content) {
			fs.stat(`${commentary[arg].file}.js`, function (err, result) {
				if (err) {
					throw err;
				}

				fs.createWriteStream(`${commentary[arg].file}.js`, { flags: "r+", start: result.size - 1 - line.length })
                  .end(`${commentary[arg].content}${line}\t}`);
				callback();
			});
		}
	},
	onFinish = function (err) {
		if (err) {
			throw err;
		}

		console.timeEnd("File update");
	},
	onCompile = function (err) {
		if (err) {
			throw err;
		}

		console.timeEnd("Commentary compilation");
		async.each(Object.keys(commentary), updateFile, onFinish);
	},
	onStitch = function () {
		console.timeEnd("Data stitching");
		dump = scrape(data, { ignoreWhitespace: true })(".commentary-text").children("p").toArray();
		console.timeEnd("DOM construction");
		async.each(dump, processor, onCompile);
	};

http.get("http://www.espncricinfo.com/icc-world-twenty20-2016/engine/match/951367.html?innings=1;view=commentary", // needs work
(res) => {
	console.timeEnd("Request");
	res.on("data", (chunk) => { data += chunk; });
	res.on("end", onStitch);
});
