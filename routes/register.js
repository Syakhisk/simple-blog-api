const express = require("express");
const { check, validationResult } = require("express-validator");
const prisma = require("../lib/prisma");
const hash = require("../lib/hash_password");

const router = express.Router();

const validator = [
	check("username")
		.notEmpty()
		.withMessage("is required!")
		.isLength({ min: 5, max: 24 })
		.withMessage("must be at between 5 and 24 characters!"),
	check("name").notEmpty().withMessage("is required!"),
	check("password")
		.notEmpty()
		.withMessage("is required!")
		.isLength({ min: 8, max: 36 })
		.withMessage("must be at between 8 and 36 characters"),
	check("email").isEmail().withMessage("is invalid!"),
];

router.post("/", validator, async (req, res, next) => {
	const errors = validationResult(req).array();
	if (errors.length > 0) {
		res.status(422);
		res.send({ msg: errors.map((e) => `${e.param} ${e.msg}`) });
		return;
	}

	const users = await findUser(req.body);
	if (users.length > 0) {
		res.status(409);
		res.send({ msg: "Credentials Exists!" });
		return;
	}

	const created = await createUser(req.body);
	if (created) {
		res.status(200);
		res.send({ msg: "Account created sucessfully!" });
		return;
	}

	res.sendStatus(500);
});

const findUser = async (body) => {
	return await prisma.users.findMany({
		where: {
			OR: [
				{
					username: body.username,
					email: body.email,
				},
			],
		},
	});
};

const createUser = async (body) => {
	let data;
	const hashed_password = hash(body.password);
	try {
		data = await prisma.users.create({
			data: {
				username: body.username,
				name: body.name,
				password: hashed_password,
				email: body.email,
			},
		});
	} catch (err) {
		return null;
	}

	return data;
};

module.exports = router;
