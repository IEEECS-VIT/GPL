var fs = require("fs"),
	assert = require("assert"),

	_ = require("lodash"),
	yaml = require("js-yaml");

describe.skip("appveyor.yml", function () {
	var appveyorYAML,
		APPVEYOR_PATH = "appveyor.yml";

	before(function () {
		try {
			appveyorYAML = yaml.safeLoad(fs.readFileSync(APPVEYOR_PATH, "utf-8")); // eslint-disable-line no-sync
		}
		catch (err) {
			throw err;
		}
	});

	it("should exist", function (done) {
		fs.stat(APPVEYOR_PATH, done);
	});

	it("should have an init script for git line ending config", function () {
		assert(_.head(appveyorYAML.init) === "git config --global core.autocrlf input", "Invalid init script");
	});

	it("should have builds set for Node v4, v5, and v6", function () {
		assert.deepStrictEqual(_.map(appveyorYAML.environment.matrix, "nodejs_version"), ["4", "5", "6"],
			"Builds not set on Node v4,5,6 only");
	});

	it("should have a valid install sequence", function () {
		assert.deepStrictEqual(appveyorYAML.install, [
			{ ps: "Install-Product node $env:nodejs_version" },
			"npm install"
		],
		"Missing / invalid nodejs install statement");
	});

	it("should have MSBuild switched off", function () {
		assert(appveyorYAML.build === "off", "Build option has been left on");
	});

	it("should have a valid test sequence", function () {
		var test = appveyorYAML.test_script;

		assert.deepStrictEqual(test, ["node --version && npm --version", { cmd: "npm test" }],
			"Missing / invalid test sequence");
	});

	it("should have deploy switched off", function () {
		assert(appveyorYAML.deploy === "off", "Deploy option has been left on");
	});
});
