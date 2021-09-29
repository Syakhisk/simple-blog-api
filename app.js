const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require('cors')

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authorRouter = require("./routes/author");
const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
const categoriesRouter = require("./routes/categories");

const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cors());

// Autentikasi
app.use(function (err, req, res, next) {
	console.error(err.stack);
	if (err.type == "entity.parse.failed") {
		res.status(500).send({ msg: "Invalid JSON request!" });
		return;
	}
	res.status(500).send({ msg: "Something went wrong!" });
});

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
// app.use("/users", usersRouter);
// app.use("/author", authorRouter);
// app.use("/posts", postsRouter);
// app.use("/register", registerRouter);
// app.use("/login", loginRouter);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/author", authorRouter);
app.use("/posts", postsRouter);
app.use("/comments", commentsRouter);
app.use("/categories", categoriesRouter);

app.use("/register", registerRouter);
app.use("/login", loginRouter);

module.exports = app;
