require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
Client,
GatewayIntentBits,
ChannelType,
EmbedBuilder
} = require("discord.js");

const app = express();

app.use(cors());
app.use(express.json());

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

const sessions = {};
const replies = {};

client.once("ready", () => {
console.log(`Logged in as ${client.user.tag}`);
});

app.post("/api/chat", async (req, res) => {

try {

```
const {
  sessionId,
  name,
  message
} = req.body;

let session = sessions[sessionId];

const guild =
  await client.guilds.fetch(
    process.env.DISCORD_GUILD_ID
  );

if (!session) {

  const ticketNumber =
    Math.floor(
      1000 + Math.random() * 9000
    );

  const channel =
    await guild.channels.create({
      name: "ticket-" + ticketNumber,
      type: ChannelType.GuildText,
      parent:
        process.env.DISCORD_CATEGORY_ID
    });

  sessions[sessionId] = {
    channelId: channel.id,
    ticketNumber
  };

  session = sessions[sessionId];
}

const channel =
  await client.channels.fetch(
    session.channelId
  );

const embed =
  new EmbedBuilder()
    .setTitle("Website Message")
    .addFields(
      {
        name: "Name",
        value: name || "Unknown"
      },
      {
        name: "Session",
        value: sessionId
      },
      {
        name: "Message",
        value: message
      }
    )
    .setTimestamp();

await channel.send({
  embeds: [embed]
});

res.json({
  success: true
});
```

} catch (err) {

```
console.error(err);

res.status(500).json({
  success: false
});
```

}

});

app.get(
"/api/messages/:sessionId",
(req, res) => {

```
const sessionId =
  req.params.sessionId;

const msgs =
  replies[sessionId] || [];

replies[sessionId] = [];

res.json(msgs);
```

}
);

client.on(
"messageCreate",
async message => {

```
if (
  message.author.bot ||
  !message.channel.name.startsWith("ticket-")
) {
  return;
}

const sessionId =
  Object.keys(sessions).find(
    id =>
      sessions[id].channelId ===
      message.channel.id
  );

if (!sessionId) return;

if (!replies[sessionId]) {
  replies[sessionId] = [];
}

replies[sessionId].push({
  text: message.content,
  timestamp: Date.now()
});
```

}
);

client.login(
process.env.DISCORD_BOT_TOKEN
);

const PORT =
process.env.PORT || 10000;

app.listen(PORT, () => {
console.log(
`Server running on ${PORT}`
);
});
