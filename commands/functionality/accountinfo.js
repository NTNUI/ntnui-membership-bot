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

    const expiryDate = DateTime.fromISO(
      accountInfo.get("ntnui_contract_expiry_date"),
      { setZone: true }
    )
      .setZone("Europe/Oslo")
      .setLocale("en");
    if (!expiryDate.isValid) {
      return interaction.editReply({
        content: `❌ There was an error processing your membership expiry date.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const ntnuiExpiryDate = expiryDate.toFormat("DDD");

    const registryDateTime = DateTime.fromISO(accountInfo.get("createdAt"), {
      setZone: true,
    })
      .setZone("Europe/Oslo")
      .setLocale("en");

    if (!registryDateTime.isValid) {
      return interaction.editReply({
        content: `❌ There was an error processing your membership registry date.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const registryDate = registryDateTime.toFormat("DDD', 'T");

    const updateDateTime = DateTime.fromISO(accountInfo.get("updatedAt"), {
      setZone: true,
    })
      .setZone("Europe/Oslo")
      .setLocale("en");

    if (!updateDateTime.isValid) {
      return interaction.editReply({
        content: `❌ There was an error processing your membership update date.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const updateDate = updateDateTime.toFormat("DDD', 'T");
    const timestamp = updateDateTime.toFormat("X");

    const now = DateTime.now().setZone("Europe/Oslo");

    if (expiryDate < now) {
      // Both memberships expired (until NTNUI membership is renewed)
      return interaction.editReply({
        content: `⌛ Your **${process.env.GROUP_NAME}** and **NTNUI** membership have expired.\n\n🕒 You linked your Discord account to NTNUI at ${registryDate}.\n🔃 Updated at ${updateDate} (${timestamp}).`,
        flags: MessageFlags.Ephemeral,
      });
    } else if (!valid) {
      // Group membership expired
      return interaction.editReply({
        content: `⌛ Your **${process.env.GROUP_NAME}** membership has expired. Your **NTNUI** membership expires ${ntnuiExpiryDate}. \n\n🕒 You linked your Discord account to NTNUI at ${registryDate}.\n🔃 Updated at ${updateDate} (${timestamp}).`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      // Both memberships in good standing
      return interaction.editReply({
        content: `✅ Your **${process.env.GROUP_NAME}** membership is in good standing!\n⏳ Your **NTNUI** membership expires ${ntnuiExpiryDate}\n\n🕒 You linked your Discord account to NTNUI at ${registryDate}.\n🔃 Updated at ${updateDate} (${timestamp}).`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
