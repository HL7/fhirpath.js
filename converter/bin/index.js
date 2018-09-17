#! /usr/bin/env node

const commander = require('commander');
const { run } = require('../index');

commander
  .arguments('<path_from> <path_to>')
  .description('Convert xml test cases to yaml')
  .action(async (from, to) =>
    await run(from, to))
  .parse(process.argv);

