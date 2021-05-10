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
