require("dotenv").config();

const express = require("express");
const { check, validationResult } = require("express-validator");
const prisma = require("../lib/prisma");
const compare = require("../lib/hash_compare");
const jwt = require("jsonwebtoken");

const router = express.Router();

const validator = [
	check("username").notEmpty().withMessage("is required!"),
	check("password").notEmpty().withMessage("is required!"),
];

router.post("/", validator, async (req, res, next) => {
	const errors = validationResult(req).array();
	if (errors.length > 0) {
		res.status(422);
		res.send({ msg: errors.map((e) => `${e.param} ${e.msg}`) });
		return;
	}

	const user = await findUser(req.body);
	if (user) {
		const { username, password, role } = user;
		const matched = compare(req.body.password, user.password);
		if (matched) {
			const token = jwt.sign(
				{ username, password, role },
				process.env.ACCESS_TOKEN_SECRET
			);
			res.status(200);
			res.send({ msg: "Login successful!", token });
			return;
		}
	}

	res.status(404);
	res.send({ msg: "Login failed, check your credentials!" });
});

const findUser = async (body) => {
	return await prisma.users.findUnique({
		where: {
			username: body.username,
		},
		select: {
			username: true,
			password: true,
			role: true,
		},
	});
};

module.exports = router;
