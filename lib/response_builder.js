const responseBuilder = (data, code) => {
	return {
		code: code,
		data: data,
	};
};

module.exports = responseBuilder;
