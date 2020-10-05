const axios = require("axios");
const { stripIndents } = require("common-tags");

const nextPageEmoji = "▶️";
const prevPageEmoji = "◀️";

const generateEmbed = (course, index, total) => ({
  color: 0x57068c,
  title: `${course.subjectCode.code}-${course.subjectCode.school} ${course.deptCourseId} ${course.name}`,
  description: course.description,
  fields:
    course.sections.length <= 10
      ? [
          { name: "Sections", value: "\u200b" },
          ...course.sections.map((section) => ({
            name: `${course.subjectCode.code}-${course.subjectCode.school} ${course.deptCourseId}.${section.code}`,
            value: stripIndents`
            Professor(s): ${section.instructors.join(", ")}
            Status: ${
              section.status === "WaitList"
                ? `Waitlist (${section.waitlistTotal})`
                : section.status
            }
            Instruction: ${section.instructionMode}
          `,
            inline: true,
          })),
        ]
      : [{ name: "Sections", value: course.sections.length }],
  timestamp: new Date(),
  footer: {
    text: `Course ${index}/${total}`,
  },
});

module.exports = {
  name: "search",
  type: "schedge",
  description: "Search for NYU courses",
  cooldown: 5,
  args: true,
  usage: "[<year> <semester-code: [su, fa, sp, ja]>] <query>",
  execute: async (message, args) => {
    let year, semester, query;
    if (args.length >= 3
      && args[0].match(/[0-9]{4}/) != null
      && ["ja", "sp", "su", "fa"].indexOf(args[1]) != -1){
      [year, semester, ...query] = args;
    }
    //try to auto-detect current year and semester
    else if (args.length >= 2){
      [...query] = args;
      year = new Date().getFullYear();
      month = new Date().getMonth();
      //Jan
      if (month == 0){
        semester = "ja";
      }
      //Feb-May
      else if (month <= 4){
        semester = "sp";
      }
      //Jun-Aug
      else if (month <= 7){
        semester = "su";
      }
      //Sep-Dec
      else{
        semester = "fa";
      }
    }
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

      if (data.length === 0) {
        message.channel.send({
          embed: {
            color: 0xcf000e,
            description: "Sorry, I can't find any courses for this search.",
          },
        });
        return;
      }

      const msg = await message.channel.send({
        embed: generateEmbed(data[currentPage], currentPage + 1, data.length),
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
        const embed = generateEmbed(
          data[currentPage],
          currentPage + 1,
          data.length
        );
        await msg.edit({ embed });
      });

      collector.on("remove", async (reaction) => {
        if (reaction.emoji.name === nextPageEmoji) {
          currentPage = currentPage < data.length - 1 ? currentPage + 1 : 0;
        } else {
          currentPage = currentPage > 0 ? currentPage - 1 : data.length - 1;
        }
        const embed = generateEmbed(
          data[currentPage],
          currentPage + 1,
          data.length
        );
        await msg.edit({ embed });
      });

      collector.on("end", async () => {
        const embed = generateEmbed(
          data[currentPage],
          currentPage + 1,
          data.length
        );
        embed.color = 6381923;
        await msg.edit({ content: "This message is now inactive", embed });
      });
    } catch (error) {
      message.channel.send({
        embed: {
          color: 0xcf000e,
          description: "An unexpected error occurred. Please try again later.",
        },
      });
      console.log(error);
    }
  },
};
