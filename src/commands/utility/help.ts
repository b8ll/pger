import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ICommand } from '../../interfaces/ICommand';

export const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const commands = Array.from(interaction.client.commands.values());
    
    const commandList = commands
      .filter(cmd => cmd.data || cmd.name)
      .map(cmd => {
        if (cmd.data) {
          return `**/${cmd.data.name}**: ${cmd.data.description}`;
        } else if (cmd.name) {
          return `**.${cmd.name}**: ${cmd.description}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Available Commands')
      .setDescription(commandList)
      .setColor(0x2B2D31);

    await interaction.reply({ embeds: [embed] });
  }
}; 