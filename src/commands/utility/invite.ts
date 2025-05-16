import { SlashCommandBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { ICommand } from '../../interfaces/ICommand';

export const command: ICommand = {
  name: 'invite',
  description: 'Get the bot invite link',
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the bot invite link'),

  async execute(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const clientId = interaction.client.user?.id;
    const inviteLink = `https://discord.com/oauth2/authorize?client_id=1338188523005677678&permissions=19456&integration_type=0&scope=bot+applications.commands`;
    const supportLink = 'https://discord.gg/MGXKzt9FHX';
    const clientLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=19456&integration_type=0&scope=applications.commands+bot`;
    if (interaction instanceof Message) {
      await interaction.reply(inviteLink);
    } else {
      await interaction.reply({
        content: `[Click here to invite me to your server](${inviteLink})\n[Click here to join my support server](${supportLink})\n[Click here to use it on client](${clientLink})`,
        ephemeral: true
      });
    }
  }
}; 