module.exports = {
  name: "sections",
  type: "schedge",
  description: "Ping!",
  execute(message) {
    message.channel.send("Pong.");
  },
};
