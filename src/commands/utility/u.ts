import { Message } from 'discord.js';
import { ICommand } from '../../interfaces/ICommand';
import { 
  searchRobloxUser, 
  fetchRobloxUserData, 
  createRobloxEmbed, 
  createRobloxButtons,
  createTerminatedEmbed
} from '../../utils/robloxUtils';
import { sanitizeInput } from '../../utils/sanitizeUtils';

export const command: ICommand = {
  name: 'u',
  description: 'Get information about a Roblox user',
  usage: '.u <username>',
  
  async execute(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      await message.reply('Please provide a Roblox username');
      return;
    }

    const username = sanitizeInput(args[0]);
    const reply = await message.reply('Searching...');

    try {
      const userMatch = await searchRobloxUser(username);
      
      if (!userMatch) {
        await reply.edit({
          content: `❌ Could not find Roblox user: ${username}`
        });
        return;
      }
      
      if (userMatch.id === 0 && userMatch.isBanned) {
        const terminatedEmbed = createTerminatedEmbed(username);
        await reply.edit({
          content: null,
          embeds: [terminatedEmbed]
        });
        return;
      }

      const userId = userMatch.id;
      
      const userData = await fetchRobloxUserData(userId, username);
      
      const embed = createRobloxEmbed(userData, userId, username);
      
      const row = createRobloxButtons(userId);

      await reply.edit({
        content: null,
        embeds: [embed],
        components: [row]
      });

    } catch (error) {
      console.error('Error fetching Roblox user data:', error);
      await reply.edit({
        content: '❌ An error occurred while fetching user information. Please try again later.',
        embeds: [],
        components: []
      });
    }
  }
}; 