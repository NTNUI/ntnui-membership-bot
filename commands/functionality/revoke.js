const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionFlagsBits,
  InteractionContextType,
} = require("discord.js");
const { fetchRole } = require("../../utilities");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("revoke")
    .setDescription(
      `Revoke ${process.env.MEMBER_ROLE} role from a Discord user.`
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to revoke the role from.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction, client) {
    const member = interaction.options.getMember("target");
    const role = await fetchRole(client);

    if (!role) {
      return interaction.reply({
        content: `❔ Role ${process.env.MEMBER_ROLE} not found in this server.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      if (
        member.roles.cache.some((role) => role.name === process.env.MEMBER_ROLE)
      ) {
        await member.roles.remove(role);
        return interaction.reply({
          content: `✅ Successfully revoked the ${process.env.MEMBER_ROLE} role from ${member.displayName}.`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          content: `❌ ${member.displayName} had no ${process.env.MEMBER_ROLE} role to revoke.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      return interaction.reply({
        content: `⚠️ Error: Failed to revoke role\n${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
