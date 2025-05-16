import { REST } from 'discord.js';
import { logger } from '../services/core/logger';
import dotenv from 'dotenv';

dotenv.config();

async function validateToken(): Promise<void> {
  try {
    const token = process.env.DISCORD_TOKEN;
    
    if (!token) {
      logger.error('No Discord token found in environment variables');
      return;
    }
    
    const rest = new REST({ version: '10' }).setToken(token);
    
    const botInfo = await rest.get('/users/@me');
    
    logger.info('Token validation successful');
    logger.info(`Bot authorized as: ${(botInfo as any).username}#${(botInfo as any).discriminator}`);
    logger.info(`Application ID: ${(botInfo as any).id}`);
  } catch (error) {
    logger.error('Token validation failed:', error);
    logger.error('Please check your DISCORD_TOKEN in the .env file or regenerate a new token from Discord Developer Portal');
  }
}

if (require.main === module) {
  validateToken().catch(error => {
    logger.error('Unexpected error during token validation:', error);
    process.exit(1);
  });
}

export { validateToken }; 