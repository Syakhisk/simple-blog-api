const faker = require("faker");
const hash = require("../lib/hash_password");

const { PrismaClient } = require("@prisma/client");
const { default: axios } = require("axios");
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

const seedItem = {
  posts: true,
  // users: true,
  // categories: true,
  // comment: true,
};

(async () => {
  if (seedItem.users) {
    const users = await seedUsers();
    console.log(users.length);
  }

  if (seedItem.categories) {
    const categories = await seedCategories();
    console.log(categories.length);
  }

  if (seedItem.posts) {
    const posts = await seedPosts();
    console.log(posts.length);
  }

  if (seedItem.comments) {
    const comments = await seedComments();
    console.log(comments.length);
  }
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

  await deleteBeforeCreate("users", true);
  data.map(async (single) => {
    await prisma.users.create({ data: single });
  });

  return data;
}

async function seedPosts(count = defaults.postCount) {
  const wh = ["When to", "How to", "Where to", "What is", "Who"];

  let data = [];

  for (let i = 0; i < count; i++) {
    console.log(`Posts ${i}`)
    const single = {};

    const word = faker.random.arrayElement(wh);
    single.title = word + " " + faker.git.commitMessage();
    single.slug = faker.helpers.slugify(single.title).toLowerCase();
    single.content = faker.lorem.paragraphs(3)
    single.content += `\n`
    single.content += `\n`
    single.content += faker.lorem.paragraphs(10)
    single.content += `\n`
    single.content += `\n`
    single.content += faker.lorem.paragraphs(5)
    single.excerpt = faker.random.words(5);
    // single.thumbnail = faker.image.image();
    single.thumbnail = await axios.get("https://source.unsplash.com/random/800x600").then(res => res.request.res.responseUrl)
    single.author = faker.datatype.number(defaults.userCount - 1) + 1
    single.categories =
      faker.datatype.number(defaults.categories.length - 1) + 1;

    data.push(single);
  }

  await deleteBeforeCreate("posts", true);
  data.map(async (single) => {
    await prisma.posts.create({ data: single });
  });

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

  await deleteBeforeCreate("comments", true);
  data.map(async (single) => {
    await prisma.comments.create({ data: single });
  });

  return data;
}

async function seedCategories(categories = defaults.categories) {
  const wh = ["When to", "How to", "Where to", "What is", "Who"];
  const data = [];

  for (let categ of categories) {
    const single = {};
    const word = faker.random.arrayElement(wh);

    single.name = categ;
    single.description = word + " " + faker.lorem.sentence(3);
    single.slug = faker.helpers.slugify(categ);

    data.push(single);
  }

  await deleteBeforeCreate("category", true);
  data.map(async (single) => {
    await prisma.category.create({ data: single });
  });

  return categories;
}

async function deleteBeforeCreate(tableName, status) {
  if (status) {
    await prisma[tableName].deleteMany();
    await prisma.$executeRaw`UPDATE sqlite_sequence SET seq = 0 WHERE name = ${tableName};`;
  }
}
