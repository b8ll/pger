import { Client } from 'discord.js';
import { logger } from '../services/core/logger';
import * as readyEvent from './ready';
import * as interactionCreate from './interactionCreate';
import * as messageCreate from './messageCreate';

export function registerEvents(client: Client): void {
  try {
    if (readyEvent.event.once) {
      client.once(readyEvent.event.name, (...args) => readyEvent.event.execute(client, ...args));
    } else {
      client.on(readyEvent.event.name, (...args) => readyEvent.event.execute(client, ...args));
    }
    
    client.on('interactionCreate', interactionCreate.execute);
    client.on('messageCreate', messageCreate.execute);
    
    logger.info('Events registered successfully');
  } catch (error) {
    logger.error('Error registering events:', error);
  }
} 