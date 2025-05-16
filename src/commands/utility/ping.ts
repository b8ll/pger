import { SlashCommandBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { ICommand } from '../../interfaces/ICommand';

export const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  async execute(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const sent = interaction instanceof Message ? 
      await interaction.reply('Pinging...') :
      await interaction.deferReply();

    const ping = interaction instanceof Message ?
      sent.createdTimestamp - interaction.createdTimestamp :
      interaction.client.ws.ping;

    const response = `🏓 Pong!\nLatency: ${ping}ms`;

    if (interaction instanceof Message) {
      await sent.edit(response);
    } else {
      await interaction.editReply(response);
    }
  }
}; 