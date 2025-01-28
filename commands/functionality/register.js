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
    const phone_number = interaction.options.getString("phone_number");
    const discordId = interaction.member.id;
    // every eligible member must /register <phone_number>
    // this calls a function that iterates over all members,
    // find member with corresponding phone number and set their
    // ntnui_no as value to their Discord ID key.
    const phone_regex = /^\+\d+$/;
    const memberships = await fetchMemberships();
    const role = await fetchRole(client);
    const registered = await Membership.findOne({
      where: { discord_id: discordId },
    });

    if (registered) {
      return interaction.reply({
        content: `❌ Your Discord account is already registered.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!phone_number.match(phone_regex)) {
      return interaction.reply({
        content: `❌ Please use a phone number with its country code (for example +47).`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // new entry into database
    for (i = 0; i < memberships.results.length; i++) {
      if (phone_number !== memberships.results[i].phone_number) {
        continue;
      }

      try {
        const new_entry = new Membership({
          discord_id: discordId,
          ntnui_no: memberships.results[i].ntnui_no,
          has_valid_group_membership:
            memberships.results[i].has_valid_group_membership,
          ntnui_contract_expiry_date:
            memberships.results[i].ntnui_contract_expiry_date,
        });
        await new_entry.save();

        if (role && new_entry.has_valid_group_membership) {
          await interaction.member.roles.add(role);
        }
        return interaction.reply({
          content: `🎉 Your Discord account has successfully been linked to NTNUI, welcome aboard **${memberships.results[i].first_name} ${memberships.results[i].last_name}**`,
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        console.log(error);
        if (error.code === 11000) {
          return interaction.reply({
            content: `⚠️ Error: Either Discord ID or phone number is already registered.`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    }

    return interaction.reply({
      content: `💭 '${phone_number}' is not an active phone number.\n📝 If this is your phone number, head over here to [✨ NTNUI ✨](https://medlem.ntnui.no/register/verify) to activate your NTNUI account!`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
