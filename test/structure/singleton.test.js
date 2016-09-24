var fs = require("fs"),
    path = require("path"),
    assert = require("assert"),

    _ = require("lodash");

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

    it("should have a valid ESLint config", function (done) {
        fs.stat(".eslintrc", done);
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
