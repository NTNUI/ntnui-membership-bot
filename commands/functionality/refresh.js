const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionFlagsBits,
  InteractionContextType,
} = require("discord.js");
const { Membership } = require("../../db.js");
const { fetchMemberships, fetchRole } = require("../../utilities.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh and sync memberships statuses.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction, client) {
    const role = await fetchRole(client);
    const guild = interaction.guild;
    const members = guild.members.cache;

    const membershipMap = await fetchMemberships();
    // iterate over every membership in group
    for (const membership of membershipMap.values()) {
      const currentRow = await Membership.findOne({
        ntnui_no: membership.ntnui_no,
      });

      if (!currentRow) {
        continue;
      }

      const discordId = currentRow.get("discord_id");
      const registeredMember = members.get(discordId);

      if (!registeredMember) {
        continue;
      }

      await Membership.findOneAndUpdate(
        { discord_id: discordId },
        {
          has_valid_group_membership: membership.has_valid_group_membership,
          ntnui_contract_expiry_date: membership.ntnui_contract_expiry_date,
        }
      );
      if (membership.has_valid_group_membership) {
        // grant current member MEMBER_ROLE
        await registeredMember.roles.add(role);
      } else {
        // revoke MEMBER_ROLE
        await registeredMember.roles.remove(role);
      }
    }

    return interaction.editReply({
      content: "🔃 Memberships have been refreshed!",
      flags: MessageFlags.Ephemeral,
    });
  },
};
