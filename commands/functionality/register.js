const {
  SlashCommandBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");
const { Membership } = require("../../db.js");
const { fetchMemberships, fetchRole } = require("../../utilities.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setNameLocalizations({
      no: "registrer",
      "sv-SE": "registrera",
      de: "registrieren",
      pl: "rejestrować",
      fi: "rekisteröidy",
    })
    .setDescription("Register your Discord account to your NTNUI account.")
    .setDescriptionLocalizations({
      no: "Registrer din NTNUI-konto til Discord-kontoen din.",
      "sv-SE": "Registrera ditt NTNUI-konto på ditt Discord-konto.",
      de: "Registrieren Sie Ihr NTNUI-Konto bei Ihrem Discord-Konto.",
      pl: "Zarejestruj swoje konto NTNUI na swoim koncie Discord.",
      fi: "Rekisteröi NTNUI-tilisi Discord-tilillesi.",
    })
    .addStringOption((option) =>
      option
        .setName("phone_number")
        .setNameLocalizations({
          no: "telefonnummer",
          "sv-SE": "telefonnummer",
          de: "telefonnummer",
          pl: "numer",
          fi: "puhelinnumero",
        })
        .setDescription(
          "The phone number registered to your NTNUI account — include country code (e.g. +47)."
        )
        .setDescriptionLocalizations({
          no: "Telefonnummeret som er registrert til din NTNUI-konto.",
          "sv-SE": "Telefonnumret som är registrerat på ditt NTNUI-konto.",
          de: "Die Telefonnummer, die in Ihrem NTNUI-Konto registriert ist.",
          pl: "Numer telefonu zarejestrowany na Twoim koncie NTNUI.",
          fi: "NTNUI-tiliisi rekisteröity puhelinnumero.",
        })
        .setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(interaction, client) {
    const phoneNumber = interaction.options.getString("phone_number");
    const normalizedPhoneNumber = phoneNumber.replace(/\s+/g, "");
    const discordId = interaction.member.id;
    // every eligible member must /register <phone_number>
    // this calls a function that iterates over all members,
    // find member with corresponding phone number and set their
    // ntnui_no as value to their Discord ID key.
    const phoneRegex = /^\+\d+$/;
    const role = await fetchRole(client);
    const registered = await Membership.findOne({
      discord_id: discordId,
    });

    if (registered) {
      return interaction.editReply({
        content: `❌ Your Discord account is already registered.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!normalizedPhoneNumber.match(phoneRegex)) {
      return interaction.editReply({
        content: `❌ Please use a phone number with its country code (for example +47).`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const membershipMap = await fetchMemberships();
    const member = membershipMap.get(normalizedPhoneNumber);

    // new entry into database
    try {
      const newEntry = new Membership({
        discord_id: discordId,
        ntnui_no: member.ntnui_no,
        has_valid_group_membership: member.has_valid_group_membership,
        ntnui_contract_expiry_date: member.ntnui_contract_expiry_date,
      });
      await newEntry.save();

      if (role && newEntry.has_valid_group_membership) {
        await interaction.member.roles.add(role);
      }
      return interaction.editReply({
        content: `🎉 Your Discord account has successfully been linked to NTNUI, welcome aboard **${member.first_name} ${member.last_name}**`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        return interaction.editReply({
          content: `⚠️ Error: Either Discord ID or phone number is already registered.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    return interaction.editReply({
      content: `💭 '${phoneNumber}' is not an active phone number.\n📝 If this is your phone number, head over here to [✨ NTNUI ✨](https://medlem.ntnui.no/register/verify) to activate your NTNUI account!`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
