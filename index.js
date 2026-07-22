const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection,
} = require("@discordjs/voice");
const { token, channel_voice_id, guild_id } = require("./config.json");

// bot system.
const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(
    (v) => typeof v === "number",
  ),
  allowedMentions: {
    repliedUser: false,
    roles: false,
    users: false,
  },
});

// functions

async function connectToMainVoice(guild) {
  const channel = client.channels.cache.get(channel_voice_id);
  if (!channel || !channel.isVoiceBased()) {
    console.log("invalid voice channel");
    return null;
  }

  const oldConnection = getVoiceConnection(guild.id);
  if (oldConnection) {
    try {
      oldConnection.destroy();
    } catch {}
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
    console.log(`Joined ${channel.id}`);
    return connection;
  } catch (err) {
    connection.destroy();
    console.log("failed to connect", err);
    return null;
  }
}

client.once("clientReady", async () => {
  console.log(`${client.user.displayName} is online.`);

  const guild = client.guilds.cache.get(guild_id);
  if (!guild) {
    console.log("Invalid guild id");
    return;
  }

  await connectToMainVoice(guild);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (oldState.id !== client.user.id) return;

  if (oldState.channelId === newState.channelId) return;

  setTimeout(async () => {
    const me = newState.guild.members.me;

    if (!me) return;

    if (me.voice.channelId !== channel_voice_id) {
      console.log("Bot moved or disconnected, forcing reconnect...");
      await connectToMainVoice(newState.guild);
    }
  }, 2000);
});

client.login(token);
