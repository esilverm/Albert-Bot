/* eslint-disable indent */
const axios = require("axios");
const { stripIndents } = require("common-tags");

const nextPageEmoji = "▶️";
const prevPageEmoji = "◀️";

const generateEmbed = (course) => ({
  color: 0x57068c,
  title: `${course.subjectCode.code}-${course.subjectCode.school} ${course.deptCourseId} ${course.name}`,
  description: course.description,
  fields:
    course.sections.length <= 10
      ? course.sections.map((section) => ({
          name: `${course.subjectCode.code}-${course.subjectCode.school} ${course.deptCourseId}.${section.code}`,
          value: stripIndents`
            Professor(s): ${section.instructors.join(", ")}
            Status: ${section.status}
            Instruction: ${section.instructionMode}
          `,
          inline: true,
        }))
      : [{ name: "Sections", value: course.sections.length }],
  timestamp: new Date(),
});

module.exports = {
  name: "schedge",
  type: "schedge",
  description: "Search for NYU courses",
  cooldown: 10,
  args: true,
  usage: "<year> <semester-code: [su, fa, sp, ja]> <query>",
  execute: async (message, args) => {
    const [year, semester, ...query] = args;
    const filter = (reaction, user) =>
      (reaction.emoji.name === nextPageEmoji ||
        reaction.emoji.name === prevPageEmoji) &&
      user.id === message.author.id;

    let currentPage = 0;
    try {
      const { data } = await axios({
        method: "get",
        url: `https://schedge.a1liu.com/${year}/${semester}/search`,
        params: {
          full: true,
          query: query.join("+"),
          limit: 10,
        },
      });
      const msg = await message.channel.send({
        embed: generateEmbed(data[currentPage]),
      });

      const collector = msg.createReactionCollector(filter, {
        time: 900000,
        idle: 120000,
        dispose: true,
      });

      await msg.react(prevPageEmoji);
      await msg.react(nextPageEmoji);

      collector.on("collect", async (reaction) => {
        if (reaction.emoji.name === nextPageEmoji) {
          currentPage = currentPage < data.length - 1 ? currentPage + 1 : 0;
        } else {
          currentPage = currentPage > 0 ? currentPage - 1 : data.length - 1;
        }
        const embed = generateEmbed(data[currentPage]);
        await msg.edit({ embed });
      });

      collector.on("remove", async (reaction) => {
        if (reaction.emoji.name === nextPageEmoji) {
          currentPage = currentPage < data.length - 1 ? currentPage + 1 : 0;
        } else {
          currentPage = currentPage > 0 ? currentPage - 1 : data.length - 1;
        }
        const embed = generateEmbed(data[currentPage]);
        await msg.edit({ embed });
      });

      collector.on("end", async () => {
        const embed = generateEmbed(data[currentPage]);
        embed.color = 6381923;
        await msg.edit({ content: "This message is now inactive", embed });
      });
    } catch (error) {
      message.channel.send("An unexpected error occured. Try again later");
      console.log(error);
    }
  },
};

// #57068c
