require("dotenv").config();

const cors = require("cors");

const {
Client,
GatewayIntentBits,
ChannelType,
EmbedBuilder
} = require("discord.js");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "https://jsautorentals.com",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());
app.options("*", cors());

app.use(express.json());

app.get("/", (req, res) => {
res.send("J&S Auto Rentals Support Bot Online");
});

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});
app.post('/api/chauffeur-request', async (req,res)=>{

const data = req.body;

await transporter.sendMail({

from: process.env.EMAIL_USER,

to: 'support@jsautorentals.com',

subject: 'New Chauffeur Lead',

html: `
<h2>New Chauffeur Request</h2>

<p><strong>Name:</strong> ${data.name}</p>

<p><strong>Email:</strong> ${data.email}</p>

<p><strong>Phone:</strong> ${data.phone}</p>

<p><strong>Service:</strong> ${data.service}</p>

<p><strong>Vehicle:</strong> ${data.vehicle}</p>

<p><strong>Hours:</strong> ${data.hours || '-'}</p>

<p><strong>Pickup:</strong> ${data.pickup || '-'}</p>
`
});

res.json({success:true});

});
const sessions = {};
const replies = {};

client.once("ready", () => {
console.log(`Logged in as ${client.user.tag}`);
});

app.post("/api/chat", async (req, res) => {


try {

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
            .setColor(0x00FFD1)
            .addFields(
                {
                    name: "Subject",
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

} catch (err) {

    console.error(err);

    res.status(500).json({
        success: false,
        error: err.message
    });

}


});

app.get("/api/messages/:sessionId", (req, res) => {


const sessionId =
    req.params.sessionId;

const msgs =
    replies[sessionId] || [];

replies[sessionId] = [];

res.json(msgs);


});

client.on("messageCreate", async message => {


if (message.author.bot) return;

if (
    !message.channel.name ||
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
    sender: "Support Team",
    timestamp: Date.now()
});


});

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
