const prisma = require("./prisma");
let currentDate = new Date();
currentDate.setHours(currentDate.getHours() + 7);
module.exports = async function (id = null) {
	let data;
	if (id) {
		data = await prisma.users.findUnique({
			where: {
				id: Number(id),
			},
		});
	} else {
		data = await prisma.users.findMany({
			// include: {
			// 	posts: true,
			// 	profile: true,
			// },
		});
	}
	return data;
};
