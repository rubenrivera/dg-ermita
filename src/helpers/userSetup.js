function userMarkdownSetup(md) {
  // The md parameter stands for the markdown-it instance used throughout the site generator.
  // Feel free to add any plugin you want here instead of /.eleventy.js
}
function userEleventySetup(eleventyConfig) {
  // The eleventyConfig parameter stands for the the config instantiated in /.eleventy.js.
  // Feel free to add any plugin you want here instead of /.eleventy.js
  // const { headerToId, namedHeadingsFilter } = require("./src/helpers/utils");
  const app = require('./src/helpers/auth/server');
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));

}

exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
