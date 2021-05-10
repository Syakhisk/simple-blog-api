const { validationResult } = require("express-validator");
const validate = (req, res) => {
	const errors = validationResult(req).array();

	if (errors.length > 0) {
		res.status(422);
		res.send({ msg: errors.map((e) => `${e.param} ${e.msg}`) });
		return false;
	}
	return true;
};

module.exports = validate;
