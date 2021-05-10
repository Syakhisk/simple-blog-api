const express = require("express");
const router = express.Router();
const authenticateToken = require("../lib/authenticate_token");
const prisma = require("../lib/prisma");
const { body, check } = require("express-validator");
const validate = require("../lib/validate");

router.get("/", async (req, res, next) => {
	let data;
	const page = req.query.page;
	if (page) {
		data = await posts({ page });
		res.send(data);
	} else {
		data = await posts();
		res.send(data);
	}
});

router.get("/:identifier", async (req, res, next) => {
	let data;
	const identifier = req.params.identifier;

	if (isNaN(identifier)) {
		data = await posts({ slug: identifier });
	} else {
		data = await posts({ id: identifier });
	}

	if (data) {
		res.send(data);
	} else {
		res.status(404);
		res.send({ message: "Post not found!" });
	}
});

const createValidation = [
	check("title").notEmpty().withMessage("is required!"),
	check("content").notEmpty().withMessage("is required!"),
];

const modifyValidation = [
	body("slug")
		.if(body("id").not().exists())
		.notEmpty()
		.withMessage("or id is required!")
		.bail()
		.if(body("slug").not().exists())
		.notEmpty()
		.withMessage("or slug is required!"),
];

/**
 * Create a new post
 */
router.post(
	"/",
	authenticateToken,
	createValidation,
	async (req, res, next) => {
		if (!validate(req, res)) return;

		//* Authorization Process
		const userdata = await user(req.user.id);
		if (userdata.role != "author" && userdata.role != "admin") {
			res.status(401);
			res.send({
				msg: "Insufficient role authorization, you don't have write access!",
			});
			return;
		}

		if (req.body.slug) {
			const post = await posts({ slug: req.body.slug });
			if (post) {
				res.status(409);
				res.send({ msg: "Slug already exists!" });
				return;
			}
		}

		req.body.author = userdata.id;
		let data = await create(req.body);
		if (data) {
			res.status(200);
			res.send({
				msg: `Sucessfully created the post!`,
				data: {
					author: req.user.id,
					id: data.id,
					title: data.title,
					slug: data.slug,
				},
			});
		}
	}
);

/**
 * Update a post
 */
router.patch(
	"/",
	authenticateToken,
	modifyValidation,
	async (req, res, next) => {
		if (!validate(req, res)) return;

		const { id, slug } = req.body;
		const identifier = id ? { id } : { slug };
		let data;

		//* Authorization Process
		const post = await posts(identifier);
		if (!post) {
			res.status(404);
			res.send({ msg: "Post not found!" });
			return;
		}

		const userdata = await user(req.user.id);
		if (post.author != userdata.id && userdata.role != "admin") {
			res.status(401);
			res.send({
				msg: "Insufficient authorization, you don't have access to this post!",
			});
			return;
		}

		//* Post data
		const requestBody = Object.keys(req.body);
		if (!requestBody.includes("title") && !requestBody.includes("content")) {
			res.status(400);
			res.send({ msg: "Either a title or content must be specified" });
			return;
		}

		data = await update({
			id: post.id,
			title: req.body.title,
			content: req.body.content,
		});

		if (!data) {
			res.status(500);
			res.send({ msg: "Something went wrong..." });
			return;
		}

		res.send({
			msg: "Sucessfully updated the post!",
			data: {
				id: data.id,
				title: data.title,
				content: data.content,
			},
		});
	}
);

/**
 * Delete a post
 */

router.delete("/:identifier", authenticateToken, async (req, res, next) => {
	if (!validate(req, res)) return;

	let identifier = req.params.identifier;

	if (isNaN(identifier)) {
		identifier = { slug: identifier };
	} else {
		identifier = { id: identifier };
	}

	const post = await posts(identifier);
	if (!post) {
		res.status(404);
		res.send({ msg: "Post not found!" });
		return;
	}

	//* Authorization Process
	const userdata = await user(req.user.id);
	if (post.author != userdata.id && userdata.role != "admin") {
		res.status(401);
		res.send({
			msg: "Insufficient authorization, you don't have access to this post!",
		});
		return;
	}

	data = await delete_(post.id);

	if (!data) {
		res.status(500);
		res.send({ msg: "Something went wrong..." });
		return;
	}

	res.send({
		msg: "Sucessfully deleted post!",
	});
});

const create = async (body) => {
	const data = await prisma.posts.create({
		data: {
			title: body.title,
			content: body.content,
			slug: body.slug && body.slug,
			author: body.author,
		},
	});

	return data;
};

const update = async ({ id, title, content }) => {
	let data = {};
	if (title) {
		data.title = title;
	}
	if (content) {
		data.content = content;
	}

	return await prisma.posts.update({
		where: {
			id: Number(id),
		},

		data: data,
	});
};

const delete_ = async (id) => {
	return await prisma.posts.delete({
		where: {
			id: Number(id),
		},
	});
};

const posts = async (args) => {
	let data;
	if (!args) {
		data = await prisma.posts.findMany({
			take: 10,
		});

		return data;
	}

	const { id, page = 1, slug } = args;
	if (id) {
		data = await prisma.posts.findUnique({
			where: {
				id: Number(id),
			},
		});
	} else if (slug) {
		data = await prisma.posts.findUnique({
			where: {
				slug: slug,
			},
		});
	} else if (page) {
		data = await prisma.posts.findMany({
			skip: (page - 1) * 10,
			take: 10,
		});
	}

	return data;
};

const user = async (id) => {
	return await prisma.users.findUnique({
		where: {
			id: Number(id),
		},
	});
};

module.exports = router;
