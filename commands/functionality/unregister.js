const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionFlagsBits,
  InteractionContextType,
} = require("discord.js");
const { Membership } = require("../../db.js");
const { fetchRole } = require("../../utilities.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unregister")
    .setDescription("Unregister a Discord account from an NTNUI account.")
    .addUserOption((target) =>
      target
        .setName("target")
        .setDescription("Discord account to unregister.")
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
      const affectedRow = await Membership.findOneAndDelete({
        discord_id: member.id,
      });

      if (!affectedRow) {
        return interaction.reply({
          content: `❌ Discord user is not registered.`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await member.roles.remove(role);
        return interaction.reply({
          content: `✅ ${member.displayName} has been unregistered.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      interaction.reply({
        content: `⚠️ Error:\n${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
