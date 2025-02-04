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
    .setName("edit")
    .setDescription(
      "Manually change a Discord account's NTNUI connected account."
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Discord account to edit.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("phone_number")
        .setDescription(
          "The new phone number to assign this Discord account — include country code (e.g. +47)."
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction, client) {
    const role = await fetchRole(client);
    const member = interaction.options.getMember("target");
    const phone_number = interaction.options.getString("phone_number");
    const phone_regex = /^\+\d+$/;

    // check if target is registered
    const registered = await Membership.findOne({
      discord_id: member.id,
    });

    // no? tell them to register!
    if (!registered) {
      return interaction.editReply({
        content: `❔ Could not find a registered Discord account.\n\n📝 Make sure they are registered!`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // if registered, but invalid phone number, use a valid one!
    if (!phone_number.match(phone_regex)) {
      return interaction.editReply({
        content: `❌ Please use a phone number with its country code (for example +47).`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // if the role somehow does not exist, throw an error.
    if (!role) {
      return interaction.editReply({
        content: "⚠️ Error: Could not find the required role.",
        ephemeral: true,
      });
    }

    const membershipMap = await fetchMemberships();
    const fetchedMember = membershipMap.get(phone_number);

    try {
      const affectedRows = await Membership.findOneAndUpdate(
        { discord_id: member.id },
        {
          ntnui_no: fetchedMember.ntnui_no,
          has_valid_group_membership: fetchedMember.has_valid_group_membership,
          ntnui_contract_expiry_date: fetchedMember.ntnui_contract_expiry_date,
        }
      );

      await interaction.editReply({
        content: `✅ ${member.displayName} was edited, their new NTNUI ID is ${fetchedMember.ntnui_no}.`,
        flags: MessageFlags.Ephemeral,
      });

      if (affectedRows) {
        if (fetchedMember.has_valid_group_membership) {
          await member.roles.add(role);
        } else {
          await member.roles.remove(role);
        }
      }
      return;
    } catch (error) {
      if (error.code === 11000) {
        return interaction.editReply({
          content: `⚠️ Error: Phone number is already registered.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
