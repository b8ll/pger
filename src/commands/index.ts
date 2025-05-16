import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../services/core/logger';
import { ICommand } from '../interfaces/ICommand';

export async function registerCommands(client: Client): Promise<void> {
  const commands = new Collection<string, ICommand>();

  const commandFolders = readdirSync(join(__dirname)).filter(folder => 
    !folder.includes('.')
  );

  for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, folder)).filter(file => 
      file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of commandFiles) {
      const { command } = await import(join(__dirname, folder, file));

      if (command.data) {
        commands.set(command.data.name, command);
      } else if (command.name) {
        commands.set(command.name, command);
      }
    }
  }

  client.commands = commands;
  logger.info(`Loaded ${commands.size} commands`);

  const slashCommands = Array.from(commands.values())
    .filter(cmd => cmd.data)
    .map(cmd => cmd.data!.toJSON());

  try {
    if (process.env.GUILD_ID) {
      await client.guilds.cache
        .get(process.env.GUILD_ID)
        ?.commands.set(slashCommands);
      logger.info('Slash commands registered for development guild');
    } else {
      await client.application?.commands.set(slashCommands);
      logger.info('Slash commands registered globally');
    }
  } catch (error) {
    logger.error('Error registering slash commands:', error);
  }
} 