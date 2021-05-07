const express = require("express");
const get_user = require("../lib/get_users");
const router = express.Router();

/* GET users listing. */
router.get("/", async (req, res, next) => {
	const users = await get_user();
	res.send({
		code: 200,
		data: users,
	});
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	const user = await get_user(id);

	// console.log(user);
	if (user) {
		res.send({
			code: 200,
			data: user,
		});
	} else {
		res.send({
			code: 404,
			data: "User not found!",
		});
	}
});
module.exports = router;
