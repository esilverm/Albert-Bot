// Get each module's commands
const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const requireDir = require("require-dir");

const dirs = readdirSync("./commands").filter((f) =>
  statSync(join("./commands", f)).isDirectory()
);

module.exports = dirs.reduce(
  (output, dirName) => ({ ...output, ...requireDir(dirName) }),
  {}
);
