import { Client, GatewayIntentBits } from 'discord.js';
import { logger } from './services/core/logger';
import { registerCommands } from './commands';
import { connectDatabase } from './services/core/database';
import { registerEvents } from './events';

export async function createApp(): Promise<Client> {
  try {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    await connectDatabase();
    await registerCommands(client);
    await registerEvents(client);

    logger.info('App initialized successfully');
    return client;
  } catch (error) {
    logger.error('Failed to initialize app:', error);
    throw error;
  }
} 