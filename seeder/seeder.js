const faker = require("faker");
faker.setLocale("en");

(async () => {

  const wh = [
    "When to",
    "How to",
    "Where to",
    "What is",
    "Who",
  ]

  for (let i = 0; i < 10; i++) {
    const word = faker.random.arrayElement(wh)
    const title = word + ' ' +faker.git.commitMessage();
    const slug = faker.helpers.slugify(title).toLowerCase();

    console.log({ title, slug });
  }
})();
