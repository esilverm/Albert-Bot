/* eslint-disable indent */
const axios = require("axios");
const { stripIndents } = require("common-tags");
const dateFormat = require("dateformat");

const nextPageEmoji = "▶️";
const prevPageEmoji = "◀️";

const generateEmbed = (
  { deptCourseId, description, sections, subjectCode },
  index,
  total
) => ({
  color: 0x57068c,
  title: `${subjectCode.code}-${subjectCode.school} ${deptCourseId}.${
    sections[index - 1].code
  } ${sections[index - 1].name}`,
  description: description,
  fields: [
    {
      name: "Registration Number",
      value: sections[index - 1].registrationNumber,
      inline: true,
    },
    {
      name: "Instructors",
      value: sections[index - 1].instructors.join(", "),
      inline: true,
    },
    {
      name: "Units",
      value: sections[index - 1].maxUnits,
      inline: true,
    },
    {
      name: "Status",
      value: sections[index - 1].status,
      inline: true,
    },
    {
      name: "Status",
      value:
        sections[index - 1].status === "WaitList"
          ? `Waitlist (${sections[index - 1].waitlistTotal})`
          : sections[index - 1].status,
      inline: true,
    },
    {
      name: "Meetings",
      value: sections[index - 1].meetings.reduce((result, meeting, i) => {
        const dt = new Date(Date.parse(meeting.beginDate));
        const day = dateFormat(dt, "ddd");
        const time = dateFormat(dt, "h:MM");
        const endtime = dateFormat(
          new Date(dt.getTime() + meeting.minutesDuration * 60000),
          "h:MM"
        );

        return (result += `${day} ${time}-${endtime}${
          i === sections[index - 1].meetings.length - 1 ? "" : "\n"
        }`);
      }, ""),
      inline: true,
    },
    {
      name: "Campus",
      value: sections[index - 1].campus,
      inline: true,
    },
    {
      name: "Recitations",
      value: "\u200b",
    },
  ].concat(
    sections[index - 1].recitations &&
      sections[index - 1].recitations.length < 17
      ? sections[index - 1].recitations.map((recitation) => ({
          name: `Recitation: ${recitation.code}`,
          value: stripIndents`
        Instructor(s): ${recitation.instructors.join(", ")}
        Status: ${
          recitation.status === "WaitList"
            ? `Waitlist (${recitation.waitlistTotal})`
            : recitation.status
        }
        Instruction: ${recitation.instructionMode}
        Meetings: 
        ${recitation.meetings.reduce((result, meeting, i) => {
          const dt = new Date(Date.parse(meeting.beginDate));
          const day = dateFormat(dt, "ddd");
          const time = dateFormat(dt, "h:MM");
          const endtime = dateFormat(
            new Date(dt.getTime() + meeting.minutesDuration * 60000),
            "h:MM"
          );

          return (result += `${day} ${time}-${endtime}${
            i === recitation.meetings.length - 1 ? "" : "\n"
          }`);
        }, "")}
        Registration Number: ${recitation.registrationNumber}
      `,
          inline: true,
        }))
      : [
          {
            name: "Recitations",
            value: sections[index - 1].recitations
              ? "0"
              : sections[index - 1].recitations.length,
            inline: true,
          },
        ]
  ),
  timestamp: new Date(),
  footer: {
    text: `Course ${index}/${total}`,
  },
});

module.exports = {
  name: "course",
  type: "course",
  aliases: ["c"],
  description: "Get the sections for a course",
  cooldown: 30,
  args: true,
  usage: "<year> <semester-code: [su, fa, sp, ja]> <subject>-<school> <code>",
  execute: async (message, args) => {
    const [year, semester, schoolCode, deptCourseId] = args;
    const filter = (reaction, user) =>
      (reaction.emoji.name === nextPageEmoji ||
        reaction.emoji.name === prevPageEmoji) &&
      user.id === message.author.id;

    let currentPage = 0;
    try {
      const { data } = await axios({
        method: "get",
        url: `https://schedge.a1liu.com/${year}/${semester}/${
          schoolCode.split("-")[1]
        }/${schoolCode.split("-")[0]}`,
        params: {
          full: true,
        },
      });
      const course = data.filter((c) => c.deptCourseId === deptCourseId)[0];
      // console.log(course);
      if (course.sections.length === 0) {
        message.channel.send({
          embed: {
            color: 0xcf000e,
            description: "Sorry, I can't find any courses for this search.",
          },
        });
        return;
      }

      const msg = await message.channel.send({
        embed: generateEmbed(course, currentPage + 1, course.sections.length),
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
          currentPage =
            currentPage < course.sections.length - 1 ? currentPage + 1 : 0;
        } else {
          currentPage =
            currentPage > 0 ? currentPage - 1 : course.sections.length - 1;
        }
        const embed = generateEmbed(
          course,
          currentPage + 1,
          course.sections.length
        );
        await msg.edit({ embed });
      });

      collector.on("remove", async (reaction) => {
        if (reaction.emoji.name === nextPageEmoji) {
          currentPage =
            currentPage < course.sections.length - 1 ? currentPage + 1 : 0;
        } else {
          currentPage =
            currentPage > 0 ? currentPage - 1 : course.sections.length - 1;
        }
        const embed = generateEmbed(
          course,
          currentPage + 1,
          course.sections.length
        );
        await msg.edit({ embed });
      });

      collector.on("end", async () => {
        const embed = generateEmbed(
          course,
          currentPage + 1,
          course.sections.length
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
