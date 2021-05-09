const express = require("express");
const prisma = require("../lib/prisma");
const { body, check, validationResult } = require("express-validator");
const router = express.Router();

router.get("/", async (req, res, next) => {
	const data = await users();
	res.send(data);
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	const data = await users(id);

	if (data) {
		res.send(data);
	} else {
		res.status(404);
		res.send({
			msg: "User not found!",
		});
	}
});

const newUserValidation = [
	check("username")
		.notEmpty()
		.withMessage("is required!")
		.isLength({ min: 5, max: 24 }),
	check("password")
		.notEmpty()
		.withMessage("is required!")
		.isLength({ min: 8, max: 36 }),
];

router.post("/", newUserValidation, async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res
			.status(422)
			.json({ errors: errors.array().map((e) => `${e.param} ${e.msg}`) });
		return;
	}

	const db = await newUser(req.body);

	res.send(req.body);
});

const newUser = async (body) => {
	let data = await prisma.users.create({
		data: {
			username: body.username,
			password: body.password,
			email: body.email,
		},
	});

	console.log(data);

	return data;
};

const users = async (id = null) => {
	let data;
	const select = {
		id: true,
		username: true,
		name: true,
		created_at: true,
		updated_at: true,
	};

	if (id) {
		data = await prisma.users.findUnique({
			where: {
				id: Number(id),
			},
			select,
		});
	} else {
		data = await prisma.users.findMany({
			select,
		});
	}

	return data;
};
module.exports = router;
