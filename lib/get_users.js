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
			select: {
				id: true,
				username: true,
				name: true,
				created_at: true,
				updated_at: true,
			},
		});
	} else {
		data = await prisma.users.findMany({
			select: {
				id: true,
				username: true,
				name: true,
				created_at: true,
				updated_at: true,
			},
		});
	}
	return data;
};
