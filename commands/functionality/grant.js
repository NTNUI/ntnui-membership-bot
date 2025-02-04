const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionFlagsBits,
  InteractionContextType,
} = require("discord.js");
const { fetchRole } = require("../../utilities");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("grant")
    .setDescription(`Grant ${process.env.MEMBER_ROLE} role to a Discord user.`)
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to grant the role to.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction, client) {
    const member = interaction.options.getMember("target");
    const role = await fetchRole(client);
    if (!role) {
      return interaction.editReply({
        content: `❔ Role ${process.env.MEMBER_ROLE} not found in this server.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      if (
        !member.roles.cache.some(
          (role) => role.name === process.env.MEMBER_ROLE
        )
      ) {
        await member.roles.add(role);
        return interaction.editReply({
          content: `✅ Successfully granted the ${process.env.MEMBER_ROLE} role to ${member.displayName}.`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.editReply({
          content: `❌ ${member.displayName} already has the role ${process.env.MEMBER_ROLE}.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      return interaction.editReply({
        content: `⚠️ Error: Failed to grant role:\n${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
