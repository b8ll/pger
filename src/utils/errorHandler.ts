import { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../services/logger';

export async function handleCommandError(
  error: Error,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  logger.error('Command execution error:', {
    command: interaction.commandName,
    user: interaction.user.tag,
    guild: interaction.guild?.name,
    error: error.message,
    stack: error.stack
  });

  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'An error occurred while executing this command.'
    : `Error: ${error.message}`;

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      content: errorMessage
    });
  } else {
    await interaction.reply({
      content: errorMessage,
      ephemeral: true
    });
  }
} 