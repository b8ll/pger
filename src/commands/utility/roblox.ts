import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder,
  ChatInputCommandInteraction,
  InteractionEditReplyOptions
} from 'discord.js';
import fetch from 'node-fetch';
import { ICommand } from '../../interfaces/ICommand';
import { 
  searchRobloxUser, 
  fetchRobloxUserData, 
  createRobloxEmbed, 
  createRobloxButtons,
  createTerminatedEmbed
} from '../../utils/robloxUtils';
import { sanitizeInput } from '../../utils/sanitizeUtils';

const ROBLOX_API = {
  USERS: 'https://users.roblox.com/v1/users',
  THUMBNAILS: 'https://thumbnails.roblox.com/v1/users/avatar-headshot',
  SEARCH: 'https://users.roblox.com/v1/users/search',
  PRESENCE: 'https://presence.roblox.com/v1/presence/users',
  FRIENDS: 'https://friends.roblox.com/v1/users/{userId}/friends/count',
  INVENTORY: 'https://inventory.roblox.com/v1/users/{userId}/items/Hat/102611803',
  BADGES: 'https://accountinformation.roblox.com/v1/users/{userId}/roblox-badges'
};

const ROLIMONS_API = {
  PLAYER: 'https://api.rolimons.com/players/v1/playerinfo'
};

const ROBLOX_BADGES = {
  Administrator: '<:Administrator:1341818821337681940>',
  Ambassador: '<:Ambassador:1341819190872506368>',
  Bloxxer: '<:Bloxxer:1341819180881678347>',
  Bricksmith: '<:Bricksmith:1341819187798085713>',
  Combat: '<:Combat:1341819184455356447>',
  Friendship: '<:Friendship:1341819194169098261>',
  Homestead: '<:Homestead:1341819189278539827>',
  Inviter: '<:Inviter:1341819192726388848>',
  OfficialModelMaker: '<:OfficialModelMaker:1341819185935814696>',
  Veteran: '<:Veteran:1341819196530495559>',
  Warrior: '<:Warrior:1341819182634893312>'
};

const STATUS_BADGES = {
  PREMIUM: '<:Premium:1341824249547194489>',
  VERIFIED: '<:Verified:1341824252390674433>',
  BANNED: '🚫'
};

const VERIFIED_BADGES = {
  HAT: '<:Verified_Hat:1341826047108452413>',
  SIGN: '<:Verified_Sign:1341826042654097499>'
};

const ROBLOX_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Cookie': `.ROBLOSECURITY=${process.env.ROBLOX_COOKIE}`,
  'X-CSRF-TOKEN': '',
};

interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
}

interface RobloxBadge {
  id: number;
  name: string;
  description: string;
  created: string;
}

interface APIResponse {
  json(): Promise<any>;
}

export const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Get information about a Roblox user')
    .addStringOption(option =>
      option
        .setName('username')
        .setDescription('The Roblox username to look up')
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const username = sanitizeInput(interaction.options.getString('username', true));

    try {
      const userMatch = await searchRobloxUser(username);
      
      if (!userMatch) {
        await interaction.editReply({
          content: `❌ Could not find Roblox user: ${username}`
        } as InteractionEditReplyOptions);
        return;
      }
      
      if (userMatch.id === 0 && userMatch.isBanned) {
        const terminatedEmbed = createTerminatedEmbed(username);
        await interaction.editReply({
          embeds: [terminatedEmbed]
        });
        return;
      }

      const userId = userMatch.id;
      
      const userData = await fetchRobloxUserData(userId, username);
      
      const embed = createRobloxEmbed(userData, userId, username);
      
      const row = createRobloxButtons(userId);

      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });

    } catch (error) {
      console.error('Error fetching Roblox user data:', error);
      await interaction.editReply({
        content: '❌ An error occurred while fetching user information. Please try again later.'
      } as InteractionEditReplyOptions);
    }
  }
};

function formatAccountAge(createdDate: Date): string {
  const timestamp = Math.floor(createdDate.getTime() / 1000);
  return `<t:${timestamp}:D>`;
}

function formatPresence(presence: any): string {
  try {
    if (!presence) return '🔘 Offline';
    
    switch (presence.userPresenceType) {
      case 1: return '🟡 Website';
      case 2: return '🟢 Online';
      case 3: return '🎨 In Studio';
      case 4: return '🎮 In Game';
      default: return '🔘 Offline';
    }
  } catch (error) {
    console.error('Error formatting presence:', error);
    return '🔘 Offline';
  }
} 