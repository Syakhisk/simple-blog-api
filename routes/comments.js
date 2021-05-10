require("dotenv").config();
const express = require("express");
const router = express.Router();
const authenticateToken = require("../lib/authenticate_token");
const prisma = require("../lib/prisma");
const { body, check } = require("express-validator");
const validate = require("../lib/validate");
const jwt = require("jsonwebtoken");

const createValidation = [
	check("content").notEmpty().withMessage("is required!"),
];

/**
 * Get comment on a post
 */
router.get("/:post_id", async (req, res, next) => {
	const post_id = req.params.post_id;
	let data;
	if (post_id) {
		data = await posts(post_id);
	}
	res.send({ count: data.length, comments: data });
});

/**
 * Create a new comment
 */
router.post("/:post_id", createValidation, async (req, res, next) => {
	const post_id = req.params.post_id;
	if (!validate(req, res)) return;

	const post = posts(post_id);
	if (!post) {
		res.status(404).send({ msg: "Post not found!" });
		return;
	}
	req.body.post_id = post_id;

	const authHeader = req.headers["authorization"];
	let token = authHeader && authHeader.split(" ")[1];
	if (token) {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				res.status(403);
				res.send({ msg: "Your token is invalid!" });
				return;
			}
		});

		token = jwt.decode(token);
		const userdata = await user(token.id);
		if (userdata) {
			req.body.author = userdata.id;
		}
	}

	let data = await create(req.body);
	if (data) {
		res.status(200);
		res.send({
			msg: `Sucessfully created a comment!`,
			data: {
				id: data.id,
				content: data.content,
			},
		});
	}
});

/**
 * Delete a comment
 */

router.delete("/:id", authenticateToken, async (req, res, next) => {
	if (!validate(req, res)) return;
	const id = req.params.id;

	const comment = await comments(id);
	if (!comment) {
		res.status(404);
		res.send({ msg: "Comment not found!" });
		return;
	}

	//* Authorization Process
	const userdata = await user(req.user.id);
	if (comment.author != userdata.id && userdata.role != "admin") {
		res.status(401);
		res.send({
			msg: "Insufficient authorization, you don't have access to this comment!",
		});
		return;
	}

	data = await delete_(comment.id);

	if (!data) {
		res.status(500);
		res.send({ msg: "Something went wrong..." });
		return;
	}

	res.send({
		msg: "Sucessfully deleted a comment!",
	});
});

/**
 * Database queries
 */
const create = async (body) => {
	const data = await prisma.comments.create({
		data: {
			post_id: Number(body.post_id),
			author: body.author,
			content: body.content,
		},
	});

	return data;
};

const delete_ = async (id) => {
	return await prisma.comments.delete({
		where: {
			id: Number(id),
		},
	});
};

const posts = async (id) => {
	let data;

	if (id) {
		data = await prisma.comments.findMany({
			where: {
				post_id: Number(id),
			},
			select: {
				id: true,
				content: true,
				users: {
					select: {
						name: true,
					},
				},
			},
		});
	}

	return data;
};

const comments = async (id) => {
	return await prisma.comments.findUnique({
		where: {
			id: Number(id),
		},
	});
};

const user = async (id) => {
	return await prisma.users.findUnique({
		where: {
			id: Number(id),
		},
	});
};

module.exports = router;
