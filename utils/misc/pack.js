var fs = require('fs'),
	path = require('path'),

	async = require('async'),
	uglifyJs = require('uglify-js'),
	CleanCSS = require('clean-css'),

	cleanCss = new CleanCSS(),

	ASSET_PATH = path.join(__dirname, '..', '..', 'public'),
	TARGET_DIR = path.join(ASSET_PATH, 'min'),
	SCRIPTS = path.join(ASSET_PATH, 'javascript'),
	STYLES = path.relative(process.cwd(), path.join('public', 'stylesheets')),
	JS_OPTIONS = {
		mangle: true,
		mangleProperties: true,
		compress: {
			properties: true,
			dead_code: true,
			drop_debugger: true,
			conditionals: true,
			evaluate: true,
			booleans: true,
			loops: true,
			unused: true,
			hoist_funs: true,
			if_return: true,
			join_vars: true,
			cascade: true,
			collapse_vars: true,
			pure_getters: true,
			drop_console: true,
			unsafe: true
		}
	};

try {
	fs.mkdirSync(TARGET_DIR);
}
catch (err) {
	console.warn(`${TARGET_DIR} already exists`);
}

async.parallel({
	js: function (done) {
		fs.readdir(path.join(ASSET_PATH, 'javascript'), function (err, scripts) {
			if (err) {
				return done(err);
			}

			async.each(scripts, function (script, callback) {
				fs.writeFile(path.join(TARGET_DIR, script), uglifyJs.minify(path.join(SCRIPTS, script), JS_OPTIONS).code,
				callback);
			}, done);
		});
	},
	css: function (done) {
		fs.readdir(path.join(ASSET_PATH, 'stylesheets'), function (err, styles) {
			if (err) {
				return done(err);
			}

			async.each(styles, function (style, callback) {
				fs.writeFile(path.join(TARGET_DIR, style), cleanCss.minify([path.join(STYLES, style)]).styles, callback);
			}, done);
		});
	}
}, function (err) {
	if (err) {
		throw err;
	}
});
