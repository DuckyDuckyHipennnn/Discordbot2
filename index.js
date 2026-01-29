require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

function randName() {
  return "_0x" + Math.random().toString(16).slice(2, 8);
}

function obfuscateLua(code) {
  // extract strings
  const strings = [];
  code = code.replace(/"(.*?)"/g, (_, s) => {
    const id = strings.length;
    strings.push(s);
    return `__STR__[${id}]`;
  });

  const tableName = randName();
  let table = `local ${tableName} = {}\n`;

  strings.forEach((s, i) => {
    const chars = s.split("").map(c => c.charCodeAt(0)).join(",");
    table += `${tableName}[${i}] = (function()\n`;
    table += `  local t = {${chars}}\n`;
    table += `  local r = ""\n`;
    table += `  for i=1,#t do r = r .. string.char(t[i]) end\n`;
    table += `  return r\nend)()\n`;
  });

  code = code.replace(/__STR__\[(\d+)\]/g, `${tableName}[$1]`);

  return table + "\n" + code;
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!obf")) return;

  const input = message.content.slice(4).trim();
  if (!input) {
    return message.reply("❌ Send Lua code after `!obf`");
  }

  try {
    const result = obfuscateLua(input);

    if (result.length > 1900) {
      return message.reply("⚠️ Output too large. Paste smaller script.");
    }

    message.reply("```lua\n" + result + "\n```");
  } catch (e) {
    message.reply("❌ Obfuscation failed.");
  }
});

client.login(process.env.TOKEN);
