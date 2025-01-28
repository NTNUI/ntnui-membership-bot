const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionFlagsBits,
  InteractionContextType,
} = require("discord.js");
const { Membership } = require("../../db.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Get a Discord account's database entry details.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Discord account to get entry of.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const member = interaction.options.getMember("target");

    let fetchedRow = await Membership.findOne({
      discord_id: member.id,
    }).exec();

    if (!fetchedRow) {
      return interaction.reply({
        content: `❔ No database entry found for ${member.displayName}.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    fetchedRow = JSON.stringify(fetchedRow, null, 2);

    interaction.reply({
      content: `🔍 Database entry of ${member.displayName}:\n\`\`\`json\n${fetchedRow}\n\`\`\``,
      flags: MessageFlags.Ephemeral,
    });
  },
};
