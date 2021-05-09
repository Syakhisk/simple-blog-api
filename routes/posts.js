const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { body, check, validationResult } = require("express-validator");

router.get("/", async (req, res, next) => {
	let data;
	const page = req.query.page;
	if (page) {
		data = await posts({ page });
	}
	data = await posts();
	if (data) {
		res.send(data);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	const data = await posts(id);
	if (data) {
		res.send(data);
	} else {
		res.status(404);
		res.send({ message: "Post not found!" });
	}
});

const newPostValidation = [
	// check("username").notEmpty().bail().isLength({ min: 6, max: 12 }).bail(),
	// check("email").isEmail().bail(),
	// check("password").notEmpty().bail().isLength({ min: 8, max: 24 }).bail(),
];
router.post("/", newPostValidation, async (req, res, next) => {
	const id = req.params.id;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422).json({ errors: errors.array() });
		return;
	}

	if (req.body) {
		res.send(req.body);
	} else {
		res.send({ msg: "lao" });
	}
});

const posts = async (args) => {
	let data;

	if (!args) {
		data = await prisma.posts.findMany({
			take: 10,
		});

		return data;
	}

	const { id, page = 1 } = args;

	if (id) {
		data = await prisma.posts.findUnique({
			where: {
				id: Number(id),
			},
		});
	} else if (page) {
		data = await prisma.posts.findMany({
			take: page * 10,
		});
	}

	return data;
};

module.exports = router;
