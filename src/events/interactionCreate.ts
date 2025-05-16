import { 
  Client,
  Collection,
  GuildMember,
  Interaction,
  PermissionResolvable
} from 'discord.js';
import { logger } from '../services/core/logger';
import { handleCommandError } from '../utils/errorHandler';
import { ICommand } from '../interfaces/ICommand';

// Extend Client type to include commands
declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, ICommand>;
  }
}

export async function execute(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Command not found: ${interaction.commandName}`);
    await interaction.reply({
      content: 'This command is not available.',
      ephemeral: true
    });
    return;
  }

  try {
    // Check permissions if defined
    if (command.permissions && command.permissions.length > 0) {
      const member = interaction.member as GuildMember;
      if (!member) {
        await interaction.reply({
          content: 'This command can only be used in a server.',
          ephemeral: true
        });
        return;
      }

      const hasPermission = command.permissions.every((permission: PermissionResolvable) =>
        member.permissions.has(permission)
      );

      if (!hasPermission) {
        await interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true
        });
        return;
      }
    }

    await command.execute(interaction);
  } catch (error) {
    await handleCommandError(error as Error, interaction);
  }
} 