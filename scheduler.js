const schedule = require("node-schedule");
const { fetchMemberships, fetchRole } = require("./utilities.js");
const { Membership } = require("./db.js");

function refreshSchedule(client) {
  schedule.scheduleJob("0 0 6,12,18,0 * * *", async function (fireDate) {
    const memberships = await fetchMemberships();
    const role = await fetchRole(client);
    const guild = client.guilds.cache.get(process.env.guildId);
    const members = await guild.members.fetch();

    // iterate over every membership in group
    for (let i = 0; i < memberships.results.length; i++) {
      const currentRow = await Membership.findOne({
        ntnui_no: memberships.results[i].ntnui_no,
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
          has_valid_group_membership:
            memberships.results[i].has_valid_group_membership,
          ntnui_contract_expiry_date:
            memberships.results[i].ntnui_contract_expiry_date,
        }
      );
      if (memberships.results[i].has_valid_group_membership) {
        // grant current member MEMBER_ROLE
        await registeredMember.roles.add(role);
      } else {
        // revoke MEMBER_ROLE
        await registeredMember.roles.remove(role);
      }
    }

    return console.log(
      "This job was supposed to run at " +
        fireDate +
        ", but actually ran at " +
        new Date()
    );
  });
}

module.exports = { refreshSchedule };
