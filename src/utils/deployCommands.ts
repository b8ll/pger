import { REST, Routes } from 'discord.js';
import { loadCommands } from './loadCommands';
import { logger } from '../services/core/logger';

export async function deployCommands(): Promise<void> {
  try {
    const commands = await loadCommands();
    
    const slashCommands = commands
      .filter(command => command.data)
      .map(command => command.data!.toJSON());

    if (slashCommands.length === 0) {
      logger.warn('No commands found to deploy.');
      return;
    }

    logger.info(`Attempting to deploy ${slashCommands.length} slash commands...`);

    const clientId = process.env.CLIENT_ID;
    const token = process.env.DISCORD_TOKEN;

    if (!clientId) {
      throw new Error('CLIENT_ID is not defined in environment variables');
    }

    if (!token) {
      throw new Error('DISCORD_TOKEN is not defined in environment variables');
    }

    const rest = new REST({ version: '10' }).setToken(token);

    if (process.env.GUILD_ID) {
      logger.info(`Deploying commands to guild with ID: ${process.env.GUILD_ID}`);
    } else {
      logger.info('Deploying commands globally');
    }

    try {
      if (process.env.GUILD_ID) {
        const guildId = process.env.GUILD_ID;
        const response = await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: slashCommands }
        );
        
        const data = response as any[];
        logger.info(`Successfully registered ${data.length} guild commands.`);
        logger.info(`Commands deployed to guild with ID: ${guildId}`);
      } else {
        const response = await rest.put(
          Routes.applicationCommands(clientId),
          { body: slashCommands }
        );
        
        const data = response as any[];
        logger.info(`Successfully registered ${data.length} global commands.`);
      }
    } catch (error: any) {
      if (error.code === 20012) {
        logger.error('Authorization error deploying commands. Please check that:');
        logger.error('1. Your bot token is valid and not expired');
        logger.error('2. The bot has the "applications.commands" OAuth2 scope');
        logger.error('3. The bot is in the guild you\'re trying to deploy commands to');
        logger.error('4. The CLIENT_ID matches the bot\'s actual application ID');
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error deploying commands:', error);
    throw error;
  }
} 