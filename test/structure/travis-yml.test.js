var fs = require("fs"),
    assert = require("assert"),

    yaml = require("js-yaml");

describe.skip(".travis.yml", function () {
    var travisYAML,
        TRAVIS_PATH = ".travis.yml";

    before(function () {
        try {
            travisYAML = yaml.safeLoad(fs.readFileSync(TRAVIS_PATH, "utf-8")); // eslint-disable-line no-sync
        }
		catch (err) {
		    throw err;
		}
    });

    it("should exist", function (done) {
        fs.stat(TRAVIS_PATH, done);
    });

    it("should have a language field with value node_js", function () {
        assert(travisYAML.language === "node_js", "Travis build language is not set to node_js");
    });

    it("should have builds set for Node v4, v5, and v6", function () {
        assert.deepStrictEqual(travisYAML.node_js, ["4", "5", "6"], "Travis is not set to run builds on Node v4, 5, 6");
    });
});
