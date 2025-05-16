import dotenv from 'dotenv';
import { Client, Message } from 'discord.js';
import { logger } from './services/core/logger';
import { createApp } from './app';

dotenv.config();

async function startBot(): Promise<void> {
  try {
    const client = await createApp();
    
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error('DISCORD_TOKEN is not defined in environment variables');
    }
    
    await client.login(token);
    logger.info('Bot is now online!');

    client.on('messageCreate', async (message: Message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith('.')) return;

      const args = message.content.slice(1).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();

      if (!commandName) return;

      const command = client.commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(message, args);
      } catch (error) {
        console.error(error);
        await message.reply('There was an error executing that command!');
      }
    });

  } catch (error: unknown) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

startBot().catch((error: unknown) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
}); 