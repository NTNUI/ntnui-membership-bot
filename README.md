# 🤖 NTNUI membership bot

A Discord bot designed to support NTNUI groups by managing and tracking users' membership statuses efficiently.

## 🔧 What is this made of?

This project leverages the [NTNUI API](https://api.ntnui.no/) to keep track of memberships, ensuring roles in Discord reflect current statuses.
The bot is built with:

- [discord.js](https://discord.js.org/) for Discord interaction.
- [Node.js](https://nodejs.org/en) as the runtime environment.
- [MongoDB](https://www.mongodb.com/) NoSQL database program for efficient cloud storage.

## 🚀 Quick Start and prerequisites

If you have [Docker](https://www.docker.com/) installed, it is recommended to run this bot as an image.

Make sure you have the required access permissions for the API and database.

1. Clone the repository

   ```bash
   git clone https://github.com/vegardev/ntnui-membership-bot.git
   cd ntnui-membership-bot/
   ```
   
2. Build the Docker image

   ```bash
   docker build -t ntnui-membership-bot
   ```

3. Create a `.env` with the following values

   ```bash
     token=your-bot-token
     clientId=your-bot-client-id
     guildId=your-server-id
     MEMBER_ROLE=your-server-role-name
     GROUP_NAME=ntnui-group-slug
     API=your-api-access-key
     API_LINK=your-api-link
     DB_PASSWORD=your-db-password
     DB_USERNAME=your-db-username
     DB_CONNECTION=your-db-connection
   ```

4. Finally, run the bot using either method

   ```bash
   docker run -d --env-file .env ntnui-membership-bot
   ```

   You may enter the environment variables directly into the run command as well.

   ```bash
   docker run -d -e DB_USERNAME=value DB_PASSWORD=your-db-password ntnui-membership-bot
   ```

Optionally, you can clone the project yourself &mdash; it is recommended to have git and Node installed.

1. Clone the repository

   ```bash
   git clone https://github.com/vegardev/ntnui-membership-bot.git
   cd ntnui-membership-bot/
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Follow step 3 from the other method, creating a `.env` file

4. Run the bot 🎉

   ```bash
   npm start
   ```

## 🗣️ Bot commands

| Commands                        | Explanation                                                                       | Required role           |
| ------------------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| `/register <phone_number>`      | Register the current Discord account to the NTNUI account with `<phone_number>`   | Regular member          |
| `/accountinfo`                  | View the current Discord account's membership info.                               | Regular member          |
| `/unregister <phone_number>`    | Unregister a Discord account from their NTNUI account with `<phone_number>`       | 'Styret' (Board member) |
| `/grant OR revoke <target>`     | Grants or revokes membership role to `<target>`                                   | 'Styret' (Board member) |
| `/refresh`                      | Refresh the local database with up-to-date membership statuses.                   | 'Styret' (Board member) |
| `/status <target>`              | Look up a registered `<target>` Discord account's database entry.                 | 'Styret' (Board member) |
| `/edit <target> <phone_number>` | Edits a `<target>` Discord account's NTNUI connection with a new `<phone_number>` | 'Styret' (Board member) |

<p align="center">
   <img src="https://i.gyazo.com/92b7038b1ff71da85fb94ad222349e0f.gif" alt="Bot in action">
</p>

## 🕴️ Privacy &mdash; what data is being stored

Privacy is top priority.

This solution stores **Discord user IDs** and **NTNUI IDs** as key-value pairs in a remote database.

To keep track of membership validity, a true/false variable is stored for each user.

To support the future reminder feature, a membership's expiry date is also stored.

Contact us for any concerns or data removal requests at [qt@vegard.moe](mailto:qt@vegard.moe)

## 👯 Groups that use this bot

- [NTNUI Esport](https://discord.gg/ntnuiesport)

## 🛣️ Roadmap

- [x] Have a bare bones, functioning bot.
- [x] Successful integration of the NTNUI API.
- [x] Implement an automatic invitation feature for users not part of NTNUI.
- [x] Migrate from local to cloud storage.
- [ ] Implement a reminder for users 1 week ahead of group membership expiry.
- [ ] Full multi-language support.
- [ ] Provide detailed logs for administrators.

## 🙌 Contributing

Contributions are awesome! Please follow the steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to your branch (`git push origin feature-name`)
5. Open a pull request.

## 📝 License

This project is licensed under the GPL-3.0 license. See `LICENSE` for details.
