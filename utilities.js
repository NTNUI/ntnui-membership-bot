const NodeCache = require("node-cache");

const myCache = new NodeCache({ stdTTL: 600, checkperiod: 300 });

async function fetchMemberships() {
  const cacheKey = "membershipCache";
  let membershipMap = myCache.get(cacheKey);

  if (membershipMap) {
    console.log("Returning cached membership map.");
    return membershipMap;
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
    membershipMap = new Map(
      memberships.results.map((member) => [member.phone_number, member])
    );

    myCache.set(cacheKey, membershipMap);
    console.log("Data (lookup map) returned successfully.");
  } catch (error) {
    console.error(error);
  }

  return membershipMap;
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

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  parts.push(`${secs} second${seconds !== 1 ? "s" : ""}`);

  return parts.join(", ");
}

module.exports = { fetchMemberships, fetchRole, formatUptime };
