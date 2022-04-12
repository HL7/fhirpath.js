// Removes all content except version.
// When we import package.json we need only the application version.
module.exports = function loader(source) {
  const { version } = JSON.parse(source);
  return JSON.stringify({ version });
};
