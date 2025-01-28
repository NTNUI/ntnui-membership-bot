const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { Membership } = require("../../db.js");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("accountinfo")
    .setDescription("View your account's membership status."),
  async execute(interaction) {
    const accountInfo = await Membership.findOne({
      discord_id: interaction.member.id,
    });

    if (!accountInfo) {
      return interaction.reply({
        content: `❌ Your Discord user is not registered yet.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const valid = accountInfo.get("has_valid_group_membership");
    const expiry_date = moment(
      accountInfo.get("ntnui_contract_expiry_date")
    ).format("Do of MMMM, YYYY");
    const registry_date = moment(accountInfo.get("createdAt")).format(
      "D/M/YYYY"
    );
    let update_date = accountInfo.get("updatedAt");
    const timestamp = `<t:${Date.parse(update_date) / 1000}:R>`;
    update_date = moment(update_date).format("D/M/YYYY hh:mm:ss");

    if (!valid) {
      return interaction.reply({
        content: `⌛ Your membership has expired.\n\n🕒 You registered at ${registry_date}.\n🔃 Updated at ${update_date} (${timestamp}).`,
        flags: MessageFlags.Ephemeral,
      });
    }
    return interaction.reply({
      content: `⏳ Your membership expires ${expiry_date}\n\n🕒 You registered at ${registry_date}.\n🔃 Updated at ${update_date} (${timestamp}).`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
