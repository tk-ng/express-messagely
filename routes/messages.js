const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const router = new express.Router();
const Message = require("../models/message");
const ExpressError = require("../expressError");
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get(":id", ensureLoggedIn, async (req, res, next) => {
	try {
		const message = await Message.get(req.params.id);
		if (
			message.from_user.username !== req.user.username &&
			message.to_user.username !== req.user.username
		) {
			throw ExpressError("Unauthorized", 401);
		}
		return res.json({ message });
	} catch (err) {
		return next(err);
	}
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
	try {
		// const {to_username, body} = req.body;
		req.body.from_username = req.user.username;
		const message = await Message.create(req.body);
		return res.json({ message });
	} catch (err) {
		return next(err);
	}
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post(":/id/read", ensureLoggedIn, async (req, res, next) => {
	try {
		const msg = await Message.get(req.params.id);
		if (msg.to_user.username === req.user.username) {
			const message = await Message.markRead(req.params.id);
			return res.json({ message });
		}
		throw ExpressError("Unauthorized", 401);
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
