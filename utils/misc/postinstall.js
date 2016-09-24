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

if (process.platform === "win32") { // the bcrypt issue is only prevalent on Microsoft Windows
	var join = require("path").join, // eslint-disable-line global-require
		bcryptPath = join(__dirname, "..", "..", "node_modules", "bcrypt");

	// eslint-disable-next-line
	require("child_process").exec("npm i bcryptjs", () => {
		// eslint-disable-next-line global-require
		require("fs").rename(`${bcryptPath}s`, bcryptPath, function () { console.log(""); });
	});
}
