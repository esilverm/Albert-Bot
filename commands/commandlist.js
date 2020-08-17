// Similar to index but gets a list of all commands excluding help
const { readdirSync, statSync } = require("fs");
const { join } = require("path");

const dirs = readdirSync("./commands").filter((f) =>
  statSync(join("./commands", f)).isDirectory()
);

const files = dirs.reduce((out, dir) => {
  return out.concat(
    readdirSync(`./commands/${dir}`)
      .filter((f) => f !== "help.js" && f.endsWith(".js"))
      .map((val) => `./${dir}/${val}`)
  );
}, []);

module.exports = files.reduce(
  (output, file) => output.concat(require(file)),
  []
);
