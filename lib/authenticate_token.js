const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (!token) {
		res.status(401);
		res.send({
			msg: "This is a protected route, please provide an auth token!",
		});
		return;
	}

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			res.status(403);
			res.send({ msg: "Your token is invalid!" });
			return;
		}

		req.user = user;
		next();
	});
};

module.exports = authenticateToken;
