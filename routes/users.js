const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

router.get("/", async (req, res, next) => {
	const data = await users();
	res.send({ count: data.length, users: data });
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

router.delete("/:id", async (req, res, next) => {
	const id = req.params.id;
	const user = await users(id);
	if (user) {
		await delete_(user.id);
		res.send({ msg: "Sucessfully deleted user!" });
		return;
	} else {
		res.status(404).send({ msg: "User not found!" });
	}

	res.status(500);
	res.send({ msg: "Something went wrong!" });
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

const delete_ = async (id) => {
	return await prisma.users.delete({
		where: {
			id: Number(id),
		},
	});
};
module.exports = router;
