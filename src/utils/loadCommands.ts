import { promises as fs } from 'fs';
import path from 'path';
import { ICommand } from '../interfaces/ICommand';
import { logger } from '../services/core/logger';

export async function loadCommands(): Promise<ICommand[]> {
  const commands: ICommand[] = [];
  const commandsPath = path.join(__dirname, '..', 'commands');
  
  async function readCommands(dir: string) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await readCommands(filePath);
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
        try {
          const command = require(filePath);
          if (command.command) {
            commands.push(command.command);
          }
        } catch (error) {
          logger.error(`Failed to load command from ${filePath}:`, error);
        }
      }
    }
  }

  await readCommands(commandsPath);
  return commands;
} 