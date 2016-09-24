var fs = require("fs"),
	path = require("path"),

	async = require("async"),
	uglifyJs = require("uglify-js"),
	CleanCSS = require("clean-css"),

	cleanCss = new CleanCSS(),

	ASSET_PATH = path.join(__dirname, "..", "..", "public"),
	TARGET_DIR = path.join(ASSET_PATH, "min"),
	SCRIPTS = path.join(ASSET_PATH, "javascript"),
	STYLES = path.relative(process.cwd(), path.join("public", "stylesheets")),
	JS_OPTIONS = {
		mangle: false,
		mangleProperties: false,
		compress: {
			properties: false,
			dead_code: true, // eslint-disable-line camelcase
			drop_debugger: true, // eslint-disable-line camelcase
			conditionals: true,
			evaluate: true,
			booleans: true,
			loops: true,
			unused: true,
			hoist_funs: true, // eslint-disable-line camelcase
			if_return: true, // eslint-disable-line camelcase
			join_vars: true, // eslint-disable-line camelcase
			cascade: true,
			collapse_vars: false, // eslint-disable-line camelcase
			pure_getters: true, // eslint-disable-line camelcase
			drop_console: true, // eslint-disable-line camelcase
			unsafe: false
		}
	};

try {
	fs.mkdirSync(TARGET_DIR); // eslint-disable-line no-sync
}
catch (err) {
	console.warn(`${TARGET_DIR} already exists`);
}

async.parallel({
	js: function (callback) {
		fs.readdir(path.join(ASSET_PATH, "javascript"), function (err, scripts) {
			if (err) {
				return callback(err);
			}

			async.each(scripts, function (script, done) {
				fs.writeFile(path.join(TARGET_DIR, script), uglifyJs.minify(path.join(SCRIPTS, script), JS_OPTIONS)
					.code,
				done);
			}, callback);
		});
	},
	css: function (callback) {
		fs.readdir(path.join(ASSET_PATH, "stylesheets"), function (err, styles) {
			if (err) {
				return callback(err);
			}

			async.each(styles, function (style, done) {
				fs.writeFile(path.join(TARGET_DIR, style), cleanCss.minify([path.join(STYLES, style)]).styles, done);
			}, callback);
		});
	}
}, function (err) {
	if (err) {
		throw err;
	}
});
