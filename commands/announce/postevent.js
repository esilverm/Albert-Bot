/* eslint-disable no-inline-comments */
const { stripIndents } = require("common-tags");
const Discord = require("discord.js");

const exampleEmbed = {
  color: 0xf8941a, // color (optional)
  title: "Your Announcment Title", // title
  url: "https://discord.js.org", // event link (zoom, event rsvp, etc.)
  author: {
    name: "Your Club Name", // club name
    url: "https://discord.js.org", // club url (optional)
  },
  description:
    "A bit about the event you are announcing... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas bibendum augue vel laoreet tempor. Nullam ut tincidunt ex. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut eu est fringilla, blandit dolor et, mattis mi. Nam erat mi, sagittis et metus et, ultrices sagittis leo. Nam sed nunc eu ante placerat venenatis.", // club description (optional)
  fields: [
    {
      name: "Event Date(s) and Time(s)",
      value: "The date(s) of your event",
      inline: false,
    },
    {
      name: "\u200b",
      value: "\u200b",
      inline: false,
    },
    {
      name: "Meeting Details",
      value: "Zoom Link & Information/Club Meeting Location",
      inline: true,
    },
  ],
  thumbnail: {
    url:
      "https://cdn.discordapp.com/icons/744646258819596418/075d55b5fec30e4df071d6d120f0072f.webp", // club icon (optional)
  },
  image: {
    url:
      "https://cdn.discordapp.com/icons/744646258819596418/075d55b5fec30e4df071d6d120f0072f.webp", // informational event-specific image
  },
  timestamp: new Date(),
  // footer: {
  //   text:
  //     "React to this post if you would like to be pinged for this club's events",
  // },
};

module.exports = {
  name: "post-event",
  type: "announce",
  description:
    "Walks you through building an announcement for your CS-related club to be posted in the CS @ NYU Discord Club Announcements channel.",
  cooldown: 5,
  guildOnly: true,
  execute: async (message) => {
    // TODO rewrite this to check exact role id
    if (!message.member.roles.cache.some((role) => role.name === "E-Board")) {
      message.channel.send("User does not have sufficent role to run command");
    }
    const filter = (msg) => msg.author.id === message.author.id;

    // TODO if user has preset format/s skip this welcome bullshit
    try {
      const eventEmbed = new Discord.MessageEmbed();
      await message.author.send(
        stripIndents`
      Hi there! It looks like you want to make a post on behalf of your club. Lucky for you, we have a system set up to make your posting experience much easier. 
      
      Using Discord's rich embed system, you can make your club event posts look professional in just a matter of minutes! 
      Seen below is an example of what your club's post could look like.
      --------------------------------
      `,
        {
          embed: exampleEmbed,
        }
      );

      const clubNameMsg = await message.author.send(
        stripIndents`
      --------------------------------
      See how great that looks! Let's make one specifically for your club.
      
      First, please enter the *name of your club.* (You have 30 seconds to respond)`
      );

      // Await user input

      // * Get Club Name
      const clubName = await clubNameMsg.channel
        .awaitMessages(filter, {
          max: 1,
          time: 30000,
          errors: ["time"],
        })
        .then((collected) => collected.first().content);

      // * Get Club Logo
      const clubLogoMsg = await message.author.send(stripIndents`
        Alright! It looks like you are a representative of ${clubName}!
      
        Next, I'd like to learn a bit more about your club. 
        
        The next 3 questions are optional, but I **highly recommend** doing them so your post stands out. *To skip any of the next two questions please type* \`skip\` and I will not include it in your final embed.

        Please send the *url of an image containing your club's logo* (You have 90 seconds to respond).
      `);

      // since the people who use this are trused and discord won't allow non-images through I can get away with just checking if it is a valid image filetype
      const clubLogoURL = await clubLogoMsg.channel
        .awaitMessages(
          (msg) =>
            /((http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp)|skip)/.test(
              msg.content
            ) && filter(msg),
          {
            max: 1,
            time: 90000,
            errors: ["time"],
          }
        )
        .then((collected) => collected.first().content);

      eventEmbed.setThumbnail(clubLogoURL === "skip" ? null : clubLogoURL);

      // * Get Club Website URL
      const clubSiteMsg = await message.author.send(stripIndents`
        Thanks!

        Please send *the URL for your club's website* (link must begin with https/http) (You have 90 seconds to respond).
      `);

      const clubSiteURL = await clubSiteMsg.channel
        .awaitMessages(
          (msg) => /(^https?:\/\/|skip)/.test(msg.content) && filter(msg),
          {
            max: 1,
            time: 90000,
            errors: ["time"],
          }
        )
        .then((collected) => collected.first().content);

      eventEmbed.setAuthor(
        clubName,
        null,
        clubSiteURL === "skip" ? null : clubSiteURL
      );

      // * Get club primary color
      const clubColorMsg = await message.author.send(stripIndents`
        Thanks!

        Please enter a *embed color*. This is going to be displayed on the side of your embed and should match any images you include. (value must be in Hex, i.e. #FFFFFF) (You have 90 seconds to respond)
      `);

      const clubColor = await clubColorMsg.channel
        .awaitMessages(
          (msg) => /(^#[0-9A-F]{6}$|skip)/.test(msg.content) && filter(msg),
          {
            max: 1,
            time: 90000,
            errors: ["time"],
          }
        )
        .then((collected) => collected.first().content);

      eventEmbed.setColor(clubColor);

      // * Get Club Event Info
      const clubEventTitleMsg = await message.author.send(stripIndents`
        Alright, now let's get on to the actually important info: the event details.

        First enter the *title of the event*.  (You have 30 seconds to respond)
      `);

      const clubEventTitle = await clubEventTitleMsg.channel
        .awaitMessages(filter, {
          max: 1,
          time: 30000,
          errors: ["time"],
        })
        .then((collected) => collected.first().content);

      eventEmbed.setTitle(clubEventTitle);

      // * Get Club Event Info Link
      const clubEventLinkMsg = await message.author.send(stripIndents`
        Thanks!

        Next enter a *link to a URL where people can rsvp, zoom, learn about the event.* Users will be able to click on the title to visit this link. (You have 90 seconds to respond)
      `);

      const clubEventLink = await clubEventLinkMsg.channel
        .awaitMessages(
          (msg) => /(^https?:\/\/|skip)/.test(msg.content) && filter(msg),
          {
            max: 1,
            time: 90000,
            errors: ["time"],
          }
        )
        .then((collected) => collected.first().content);

      if (clubEventLink) {
        eventEmbed.setURL(clubEventLink);
      }

      // * Get Club Event Description
      const clubEventDescMsg = await message.author.send(stripIndents`
       Thanks!

       Next enter a *description for your club's event.* (You have 90 seconds to respond)
     `);

      const clubEventDescription = await clubEventDescMsg.channel
        .awaitMessages(filter, {
          max: 1,
          time: 90000,
          errors: ["time"],
        })
        .then((collected) => collected.first().content);

      eventEmbed.setDescription(clubEventDescription);

      // * Get Club Dates
      const clubEventDateMsg = await message.author.send(stripIndents`
       Great! Now let's add some fields so people know when your event is occurring.
       
       Please enter a *date and time or list of dates and times* (separated by semicolons \`;\`) (You have 90 seconds to respond)
     `);

      const clubEventDates = await clubEventDateMsg.channel
        .awaitMessages(filter, {
          max: 1,
          time: 90000,
          errors: ["time"],
        })
        .then((collected) => collected.first().content);

      eventEmbed.addField(
        "Event Date(s) and Time(s)",
        clubEventDates.split(";").join("\n")
      );

      // * Get Club Event Image
      const clubEventPosterMsg = await message.author.send(stripIndents`
       Thanks!
       
       Finally onto our last parts of the embed design.
        
        Please enter a *link to a URL for any event poster image you may have*. This will be the large image featured at the bottom so it is a great place to capture the user's interest. (You have 90 seconds to respond)
     `);

      const clubEventPoster = await clubEventPosterMsg.channel
        .awaitMessages(
          (msg) =>
            /((http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp)|skip)/.test(
              msg.content
            ) && filter(msg),
          {
            max: 1,
            time: 90000,
            errors: ["time"],
          }
        )
        .then((collected) => collected.first().content);

      eventEmbed.setImage(clubEventPoster === "skip" ? null : clubEventPoster);

      // * Get Meeting Details
      const clubEventOtherMsg = await message.author.send(stripIndents`
       Great! Now let's add some fields so people know extra info about your event
       
       Please enter a *any other information about the event* (You have 90 seconds to respond)
     `);

      const clubEventOther = await clubEventOtherMsg.channel
        .awaitMessages(
          (msg) => (filter(msg) && msg.content === "skip") || filter(msg),
          {
            max: 1,
            time: 90000,
            errors: ["time"],
          }
        )
        .then((collected) => collected.first().content);

      if (clubEventOther !== "skip") {
        eventEmbed.addField("Meeting Details", clubEventOther);
      }

      await message.author.send("Here is your finished embed:", {
        embed: eventEmbed,
      });

      const satisfiedMsg = await message.author.send(stripIndents`
      If you are happy with this and would like it to be posted publicly please say "yes", otherwise say, "no"
    `);

      const isSatisfied = await satisfiedMsg.channel
        .awaitMessages(
          (msg) =>
            (filter(msg) && msg.content === "yes") ||
            msg.content === "no" ||
            filter(msg),
          {
            max: 1,
            time: 90000,
            errors: ["time"],
          }
        )
        .then((collected) => collected.first().content);

      if (isSatisfied === "yes") {
        const channel = message.guild.channels.cache.get("602531099855552522"); // channel to post in
        channel.send({ embed: eventEmbed });
      }
    } catch (error) {
      console.log(error);
      message.author.send("**Current input has timed out. Please Try again.**");
    }

    // TODO Allow users to save their formats for later use so they can just put in post content and an image
  },
};
