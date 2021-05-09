const bcrypt = require("bcrypt");

module.exports = function (plaintext) {
	return bcrypt.hashSync(plaintext, 10);
};
