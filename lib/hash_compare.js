const bcrypt = require("bcrypt");

module.exports = function (plaintext, hash) {
	// console.log({ plaintext, hash });
	return bcrypt.compareSync(plaintext, hash);
};
