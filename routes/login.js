require("dotenv").config();

const express = require("express");
const { check } = require("express-validator");
const validate = require("../lib/validate");
const prisma = require("../lib/prisma");
const compare = require("../lib/hash_compare");
const jwt = require("jsonwebtoken");

const router = express.Router();

const validator = [
	check("username").notEmpty().withMessage("is required!"),
	check("password").notEmpty().withMessage("is required!"),
];

router.post("/", validator, async (req, res, next) => {
	if (!validate(req, res)) return;

	const user = await findUser(req.body);
	if (user) {
		const { id, username, password, role } = user;
		const matched = compare(req.body.password, user.password);
		if (matched) {
			const token = jwt.sign(
				{ id, username, password, role },
				// process.env.ACCESS_TOKEN_SECRET,
				"secret-token",
				{ expiresIn: "10m" }
			);
			res.status(200);
			res.send({
				msg: "Login successful!",
				data: { id, username, role, token },
			});
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
			id: true,
			username: true,
			password: true,
			role: true,
		},
	});
};

module.exports = router;
