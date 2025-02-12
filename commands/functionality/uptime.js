const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { formatUptime } = require("../../utilities");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription(
      "Display the continuous time the bot has been online since its last restart."
    ),
  async execute(interaction, client) {
    const botUser = client.user;
    let uptime = Math.floor(process.uptime());
    uptime = formatUptime(uptime);

    interaction.editReply({
      content: `🏃‍♀️ ${botUser.username} has been running for ${uptime}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
