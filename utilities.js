async function fetchMemberships() {
  const apiCall = process.env.API_LINK;
  let memberships = [];

  try {
    const response = await fetch(apiCall, {
      headers: {
        accept: "application/json",
        "API-KEY": process.env.API,
      },
    });
    if (!response.ok) {
      throw new Error("Could not connect to Sprint API.");
    }
    memberships = await response.json();
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
