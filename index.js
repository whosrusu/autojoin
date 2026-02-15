const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const { token, channel_voice_id, guild_id } = require("./config.json");

const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(
    (v) => typeof v === "number"
  ),
  allowedMentions: {
    repliedUser: false,
    roles: false,
    users: false,
  },
});

client.on("clientReady", async () => {
  console.log(`${client.user.displayName} is online.`);

  let channelVoice = client.channels.cache.get(channel_voice_id);
  let guild = client.guilds.cache.get(guild_id);

  try {
    let conn = await joinVoiceChannel({
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      channelId: channelVoice.id,
      selfDeaf: true,
    });
    conn.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        conn.rejoin();
      } catch {
        console.log("invalid channel voice id");
      }
    });
  } catch {
    console.log("error channel voice id.");
  }
});

client.login(token);
