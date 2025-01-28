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
    const memberships = await fetchMemberships();
    const role = await fetchRole(client);
    const member = interaction.options.getMember("target");
    const phone_number = interaction.options.getString("phone_number");
    let new_ntnui_no = 0;
    let new_has_valid_group_membership = false;
    const phone_regex = /^\+\d+$/;

    // check if target is registered
    const registered = await Membership.findOne({
      discord_id: member.id,
    });

    // no? tell them to register!
    if (!registered) {
      return interaction.reply({
        content: `❔ Could not find a registered Discord account.\n\n📝 Make sure they are registered!`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // if registered, but invalid phone number, use a valid one!
    if (!phone_number.match(phone_regex)) {
      return interaction.reply({
        content: `❌ Please use a phone number with its country code (for example +47).`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // if the role somehow does not exist, throw an error.
    if (!role) {
      return interaction.reply({
        content: "⚠️ Error: Could not find the required role.",
        ephemeral: true,
      });
    }

    // iterate over every membership in group
    for (let i = 0; i < memberships.results.length; i++) {
      if (phone_number !== memberships.results[i].phone_number) {
        continue;
      }

      new_ntnui_no = memberships.results[i].ntnui_no;
      new_ntnui_contract_expiry_date =
        memberships.results[i].ntnui_contract_expiry_date;
      new_has_valid_group_membership =
        memberships.results[i].has_valid_group_membership;
    }

    try {
      const affectedRows = await Membership.findOneAndUpdate(
        { discord_id: member.id },
        {
          ntnui_no: new_ntnui_no,
          has_valid_group_membership: new_has_valid_group_membership,
          ntnui_contract_expiry_date: new_ntnui_contract_expiry_date,
        }
      );

      await interaction.reply({
        content: `✅ ${member.displayName} was edited, their new NTNUI ID is ${new_ntnui_no}.`,
        flags: MessageFlags.Ephemeral,
      });

      if (affectedRows) {
        if (new_has_valid_group_membership) {
          await member.roles.add(role);
        } else {
          await member.roles.remove(role);
        }
      }
      return;
    } catch (error) {
      if (error.code === 11000) {
        return interaction.reply({
          content: `⚠️ Error: Phone number is already registered.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
