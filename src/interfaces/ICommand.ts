import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionResolvable } from 'discord.js';

export interface ICommand {
  data?: SlashCommandBuilder;
  name?: string;
  description?: string;
  usage?: string;
  permissions?: PermissionResolvable[];
  cooldown?: number;
  execute(interaction: ChatInputCommandInteraction | Message, args?: string[]): Promise<void>;
} 