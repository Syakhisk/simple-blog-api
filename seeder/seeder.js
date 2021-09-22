const faker = require("faker");
const hash = require("../lib/hash_password");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

faker.setLocale("en");

const defaults = {
  password: hash("secret-password"),
  userCount: 100,
  postCount: 100,
  commentCount: 100,
  categories: [
    "science",
    "tech",
    "productivity",
    "lifestyle",
    "design",
    "tips-and-tricks",
  ],
};

(async () => {
  const users = await seedUsers();
  console.log(users.length)

  const categories = await seedCategories();
  console.log(categories.length);

  const posts = await seedPosts();
  console.log(posts.length);

  const comments = await seedComments();
  console.log(comments.length);
})();

async function seedUsers(count = defaults.userCount) {
  let data = [];

  for (let i = 0; i < count; i++) {
    const single = {};

    firstName = faker.name.firstName();
    lastName = faker.name.lastName();

    single.name = `${firstName} ${lastName}`;
    single.username = faker.internet
      .userName(firstName, lastName)
      .toLowerCase();
    single.email = faker.internet.email(firstName, lastName);
    single.password = defaults.password;

    // const res = await prisma.users.create({ data: single });
    data.push(single);
  }

  await deleteBeforeCreate("users", true)
  data.map(async (single) => {
    await prisma.users.create({ data: single });
  })
  
  return data;
}

async function seedPosts(count = defaults.postCount) {
  const wh = ["When to", "How to", "Where to", "What is", "Who"];

  let data = [];

  for (let i = 0; i < count; i++) {
    const single = {};

    const word = faker.random.arrayElement(wh);
    single.title = word + " " + faker.git.commitMessage();
    single.slug = faker.helpers.slugify(single.title).toLowerCase();
    single.content = faker.random.words(20);
    single.excerpt = faker.random.words(3);
    single.thumbnail = faker.image.image();
    single.categories =
      faker.datatype.number(defaults.categories.length - 1) + 1;

    data.push(single);
  }

  await deleteBeforeCreate("posts", true)
  data.map(async (single) => {
    await prisma.posts.create({ data: single });
  })

  return data;
}

async function seedComments(count = defaults.commentCount) {
  const wh = ["When to", "How to", "Where to", "What is", "Who"];

  let data = [];

  for (let i = 0; i < count; i++) {
    const single = {};
    const word = faker.random.arrayElement(wh);
    single.content = word + " " + faker.lorem.sentence(3);
    single.post_id = faker.datatype.number(defaults.postCount - 1) + 1;

    const authorId = faker.datatype.number(defaults.userCount - 1) + 1;
    single.author = faker.datatype.boolean() ? authorId : undefined;

    data.push(single);
  }

  await deleteBeforeCreate("comments", true)
  data.map(async (single) => {
    await prisma.comments.create({ data: single });
  })

  return data;
}

async function seedCategories(categories = defaults.categories) {
  const wh = ["When to", "How to", "Where to", "What is", "Who"];
  const data = []

  for (let categ of categories) {
    const single = {};
    const word = faker.random.arrayElement(wh);

    single.name = categ
    single.description = word + " " + faker.lorem.sentence(3);
    single.slug = faker.helpers.slugify(categ)

    data.push(single);
  }


  await deleteBeforeCreate("category", true)
  data.map(async (single) => {
    await prisma.category.create({ data: single });
  })

  return categories;
}

async function deleteBeforeCreate(tableName, status){
  if (status) {
    await prisma[tableName].deleteMany();
    await prisma.$executeRaw`UPDATE sqlite_sequence SET seq = 0 WHERE name = ${tableName};`;
  }
}

