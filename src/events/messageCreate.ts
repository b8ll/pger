import { Message } from 'discord.js';
import { logger } from '../services/core/logger';

export async function execute(message: Message): Promise<void> {
  try {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Add your message handling logic here
    // For example: command prefix handling, message filtering, etc.

    logger.debug(`Message received from ${message.author.tag} in ${message.guild?.name}`);
  } catch (error) {
    logger.error('Error handling message:', error);
  }
} 