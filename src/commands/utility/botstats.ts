import { SlashCommandBuilder, ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/ICommand';

export const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName('botstats')
    .setDescription('Displays bot statistics including server count and total members'),

  async execute(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (interaction instanceof Message) {
      await interaction.reply('Gathering stats...');
    } else {
      await interaction.deferReply();
    }

    const client = interaction instanceof Message ? interaction.client : interaction.client;
    
    const serverCount = client.guilds.cache.size;
    
    let totalMembers = 0;
    client.guilds.cache.forEach(guild => {
      totalMembers += guild.memberCount;
    });

    const statsEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Bot Statistics')
      .addFields(
        { name: 'Servers', value: `${serverCount}`, inline: true },
        { name: 'Total Members', value: `${totalMembers}`, inline: true },
        { name: 'Uptime', value: formatUptime(client.uptime || 0), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Bot Stats Command' });

    if (interaction instanceof Message) {
      await interaction.edit({ content: null, embeds: [statsEmbed] });
    } else {
      await interaction.editReply({ embeds: [statsEmbed] });
    }
  }
};

function formatUptime(uptime: number): string {
  const totalSeconds = Math.floor(uptime / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ');
} 