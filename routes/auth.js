const express = require("express");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");
const router = new express.Router();
const User = require("../models/user");

const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		if (await User.authenticate(username, password)) {
			await User.updateLoginTimestamp(username);
			return res.json({ token: jwt.sign({ username }, SECRET_KEY) });
		} else {
			throw new ExpressError("Invalid username/password", 400);
		}
	} catch (err) {
		return next(err);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
	try {
		const user = await User.register(req.body);
		return res.json({
			token: jwt.sign({ username: user.username }, SECRET_KEY),
		});
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
