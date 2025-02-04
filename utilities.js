const NodeCache = require("node-cache");

const myCache = new NodeCache({ stdTTL: 600, checkperiod: 300 });

async function fetchMemberships() {
  const cacheKey = "membershipCache";
  let data = myCache.get(cacheKey);

  if (data) {
    console.log("Returning cached membership data.");
    return data;
  }

  let memberships = [];

  try {
    const response = await fetch(process.env.API_LINK, {
      headers: {
        accept: "application/json",
        "API-KEY": process.env.API,
      },
    });

    if (!response.ok) {
      throw new Error("Could not connect to Sprint API.");
    }

    memberships = await response.json();
    myCache.set(cacheKey, memberships);
    console.log("Data returned successfully.");
  } catch (error) {
    console.error(error);
  }

  return memberships;
}
async function fetchRole(client) {
  const guild = client.guilds.cache.get(process.env.guildId);
  if (!guild) {
    throw new Error("Guild not found,");
  }

  const role = guild.roles.cache.find(
    (role) => role.name === process.env.MEMBER_ROLE
  );

  return role;
}

module.exports = { fetchMemberships, fetchRole };
