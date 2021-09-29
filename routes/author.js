const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

router.get("/", async (req, res) => {
  const { page = 1, count = 10 } = req.query;
  const query = {
    // take: +count,
    // skip: (page - 1) * count,
    where: {
      NOT: {
        posts: { none: {} },
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      posts: {
        select: {
          id: true,
        },
      },
    },
  };

  const data = await prisma.users.findMany(query);
  res.send({ count: data.length, page, results: data });
});

router.get("/:username", async (req, res) => {
  const { username, page = 1, count = 10 } = req.params;

  const query = {
    take: +count,
    skip: (page - 1) * count,
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      name: true,
      posts: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          thumbnail: true,
          users: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      },
    },
  };

  const data = await prisma.users.findFirst(query);
  if (data.posts.length)
    res.send({
      count: data.posts.length,
      page,
      results: {
        id: data.id,
        username: data.username,
        name: data.name,
        posts: data.posts.map((item) => item),
      },
    });
  else res.status(404).send({ msg: "Posts not found!" });
});

module.exports = router;
