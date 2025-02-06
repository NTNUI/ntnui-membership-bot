const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { Membership } = require("../../db.js");
const { DateTime } = require("luxon");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("accountinfo")
    .setDescription("View your account's membership status."),
  async execute(interaction) {
    const accountInfo = await Membership.findOne({
      discord_id: interaction.user.id,
    });

    if (!accountInfo) {
      return interaction.editReply({
        content: `❌ Your Discord user is not registered yet.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const valid = accountInfo.get("has_valid_group_membership");
    const expiry_date = DateTime.fromISO(
      accountInfo.get("ntnui_contract_expiry_date")
    )
      .setZone("Europe/Oslo")
      .setLocale("en")
      .toFormat("DDD");

    const registry_date = DateTime.fromISO(accountInfo.get("createdAt"))
      .setZone("Europe/Oslo")
      .setLocale("en")
      .toFormat("DDD', 'T");

    const updateDateTime = DateTime.fromISO(
      accountInfo.get("updatedAt")
    ).setZone("Europe/Oslo");

    const update_date = updateDateTime.toFormat("DDD', 'T");

    const timestamp = `<t:${Math.floor(updateDateTime.toSeconds())}:R>`;

    if (!valid) {
      return interaction.editReply({
        content: `⌛ Your membership has expired.\n\n🕒 You registered at ${registry_date}.\n🔃 Updated at ${update_date} (${timestamp}).`,
        flags: MessageFlags.Ephemeral,
      });
    }
    return interaction.editReply({
      content: `⏳ Your membership expires ${expiry_date}\n\n🕒 You registered at ${registry_date}.\n🔃 Updated at ${update_date} (${timestamp}).`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
