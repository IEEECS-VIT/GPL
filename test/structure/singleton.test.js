var fs = require("fs"),
	path = require("path"),
	assert = require("assert"),

	_ = require("lodash"),
	yaml = require("js-yaml");

describe("singleton configuration files", function () {
	it("should have a README.md", function (done) {
		fs.stat("README.md", done);
	});

	it("should have a valid Procfile", function (done) {
		fs.stat("Procfile", done);
	});

	it("should have a npm-shrinkwrap.json", function () {
		// eslint-disable-next-line global-require
		var shrinkwrap = require(path.join(__dirname, "..", "..", "npm-shrinkwrap.json"));

		assert(_.isObject(shrinkwrap), "npm-shrinkwrap.json appears to be invalid");
	});

	it.skip("should have a valid .bowerrc", function (done) {
		fs.stat(".bowerrc", done);
	});

	it("should have a valid app.js", function (done) {
		fs.stat("app.js", done);
	});

	it("should have a valid .jsdocrc", function (done) {
		fs.stat(".jsdocrc", done);
	});

	it("should have a valid gitginore", function (done) {
		fs.stat(".gitignore", done);
	});

	it("should have a valid .gitattributes", function (done) {
		fs.stat(".gitattributes", done);
	});

	describe(".eslintrc", function () {
		var ESLintRc;

		before(function () {
			try {
				ESLintRc = yaml.safeLoad(fs.readFileSync(".eslintrc", "utf-8")); // eslint-disable-line no-sync
			}
			catch (err) {
				throw err;
			}
		});

		it("should exist", function (done) {
			fs.stat(".eslintrc", done);
		});

		it("should be ES6 compliant", function () {
			assert(ESLintRc.parserOptions.ecmaVersion === 6, "ESLint config may be incorrect!");
		});

		it("should have plugins enabled", function () {
			assert.deepStrictEqual(ESLintRc.plugins, ["jsdoc", "lodash", "mocha", "mongodb", "security"],
			"ESLint plugins may be incorrect!");
		});

		it("should have globals configured", function () {
			assert.deepStrictEqual(ESLintRc.globals, {
				it: true,
				db: true,
				before: true,
				after: true,
				global: true,
				afterEach: true,
				beforeEach: true,
				testFlag: true,
				testDb: true,
				describe: true
			},
			"ESLint globals may be incorrect!");
		});

		it("should have environments configured", function () {
			assert.deepStrictEqual(ESLintRc.env, { amd: true, browser: true, es6: true,	jquery: true, node: true },
			"ESLint environments may be incorrect!");
		});
	});

	it("should have a valid ESLint exclusion", function (done) {
		fs.stat(".eslintignore", done);
	});

	it("should have a valid EditorConfig", function (done) {
		fs.stat(".editorconfig", done);
	});

	it("should have a valid CSSLint config", function (done) {
		fs.stat(".csslintrc", done);
	});

	it("should have a valid views directory", function (done) {
		fs.stat("app.js", done);
	});

	it("should have a valid test directory", function (done) {
		fs.stat("test", done);
	});

	it("should have a valid utility scripts directory", function (done) {
		fs.stat("utils", done);
	});

	it("should have a valid routes directory", function (done) {
		fs.stat("routes", done);
	});

	it("should have a valid public directory", function (done) {
		fs.stat("app.js", done);
	});

	it("should have a valid node_modules directory", function (done) {
		fs.stat("node_modules", done);
	});

	it("should have a valid bin directory", function (done) {
		fs.stat("bin", done);
	});

	it("should have a valid .git directory", function (done) {
		fs.stat(".git", done);
	});
});
