require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* =========================
   SLASH COMMAND DEFINITIONS
========================= */

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  new SlashCommandBuilder()
    .setName("obf")
    .setDescription("Obfuscate a Roblox Lua script")
    .addStringOption(option =>
      option
        .setName("script")
        .setDescription("Paste your Lua script here")
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

/* =========================
   REGISTER COMMANDS
========================= */

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("Slash commands registered.");
  } catch (err) {
    console.error(err);
  }
})();

/* =========================
   SIMPLE OBFUSCATOR
========================= */

function obfuscateLua(code) {
  const encoded = Buffer.from(code).toString("base64");
  return `loadstring(game:HttpGet("data:text/plain;base64,${encoded}"))()`;
}

/* =========================
   INTERACTION HANDLER
========================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
  const sent = await interaction.reply({
    content: "Pinging...",
    fetchReply: true
  });

  const latency = sent.createdTimestamp - interaction.createdTimestamp;

  await interaction.editReply(`Pong! ${latency}ms 🏓`);
}


  if (interaction.commandName === "obf") {
    const script = interaction.options.getString("script");

    if (script.length > 1800) {
      return interaction.reply({
        content: "❌ Script too long. Please shorten it.",
        ephemeral: true
      });
    }

    const obf = obfuscateLua(script);

    await interaction.reply({
      content: "✅ **Obfuscated Script:**\n```lua\n" + obf + "\n```",
      ephemeral: true
    });
  }
});

/* =========================
   READY
========================= */

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
