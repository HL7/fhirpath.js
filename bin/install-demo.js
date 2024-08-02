/**
 * This file contains code to run "npm ci" in the demo directory if it exists.
 */
const { spawn, fork } = require('child_process');
const path = require('path');
const fs = require("fs"); // Or `import fs from "fs";` with ESM

const demoDir = path.join(__dirname, '../demo');

if (fs.existsSync(demoDir)) {
  console.log('Installing node modules in the demo directory...');
  spawn('npm', ['ci'], {
    cwd: demoDir,
    stdio: 'inherit'
  });
}
