const { prefix } = require("../../config.json");
const commands = require("../commandlist");
const { stripIndents } = require("common-tags");

const generateMainEmbed = () => ({
  title: "Command List",
  description: `Here is the list of commands!\nFor more info on a specific command, use \`${prefix}help <command>\``,
  color: 0x57068c,
  fields: [
    {
      name: "🗓 Schedge",
      value: "`schedge`, `course`",
    },
    {
      name: "🔧 Utility",
      value: "`help`",
    },
  ],
});

const generateDescription = (message, command) => {
  const commandInfo = commands.filter(
    (c) => c.name === command || (c.aliases && c.aliases.includes(command))
  )[0];

  if (command === "help") {
    return {
      embed: {
        color: 0xcf000e,
        description:
          "Idk if you need this. It looks like you got the command figured out...",
      },
    };
  }

  if (!commandInfo) {
    return {
      embed: {
        color: 0xcf000e,
        description: "Could not find that command",
      },
    };
  }

  return stripIndents`
    \`\`\`css
    ${prefix}${commandInfo.name} ${commandInfo.usage || ``}
    \`\`\`\`\`\`md
    ${
      commandInfo.aliases
        ? stripIndents`
        # Aliases
        ${commandInfo.aliases.join(" , ")}
      `
        : ``
    }
    # Description
    ${commandInfo.description}
    \`\`\`\`\`\`md
    > Remove angle brackets when using commands
    > [] = possible values
    > <> = required arguments
    > <?> = optional arguments
    \`\`\`
  `;
};

module.exports = {
  name: "help",
  type: "utils",
  description: "Get a list of usable commands for the bot.",
  cooldown: 2,
  args: false,
  usage: "<?command>",
  execute: async (message, args) => {
    if (args.length === 0) {
      message.channel.send({ embed: generateMainEmbed() });
    } else {
      message.channel.send(generateDescription(message, args[0]));
    }
  },
};
