var fs = require("fs"),
    assert = require("assert"),

    _ = require("lodash"),
    yaml = require("js-yaml"),

    CODECLIMATE_PATH = ".codeclimate.yml";

describe(CODECLIMATE_PATH, function () {
    var codeClimateYAML;

    before(function () {
		try {
            codeClimateYAML = yaml.safeLoad(fs.readFileSync(CODECLIMATE_PATH, "utf-8")); // eslint-disable-line no-sync
        }
		catch (err) {
			throw err;
		}
    });

    it("should exist", function (done) {
        fs.stat(CODECLIMATE_PATH, done);
    });

    it("should have the csslint engine enabled", function () {
        assert(codeClimateYAML.engines.csslint.enabled, "CSSLint config missing / broken");
    });

    it("should have the duplication engine enabled", function () {
        var duplicationEngine = codeClimateYAML.engines.duplication;

        assert(duplicationEngine.enabled, "Duplication config missing / broken");
        assert(_.head(duplicationEngine.config.languages) === "javascript", "Possible invalid language setting");
    });

    it("should have the ESLint engine enabled", function () {
        assert(codeClimateYAML.engines.eslint.enabled, "ESLint config missing / broken");
    });

    it("should have the Fixme engine enabled", function () {
        assert(codeClimateYAML.engines.fixme.enabled, "Fixme config missing / broken");
    });

    it("should have the MarkdownLint engine enabled", function () {
        assert(codeClimateYAML.engines.markdownlint.enabled, "MarkdownLint config missing / broken");
    });

    it("should have the NSP engine enabled", function () {
        assert(codeClimateYAML.engines.nodesecurity.enabled, "NSP config missing / broken");
    });

    it("should have a valid ratings structure", function () {
        assert.deepStrictEqual(codeClimateYAML.ratings.paths, ["**.css", "**.js", "**.md", "bin/**/*"],
            "Missing / invalid rating paths");
    });

    it("should have a field ratings, as an array", function () {
        assert(_.isArray(codeClimateYAML.exclude_paths), "Exclude paths is either missing or is in invalid format");
    });
});
