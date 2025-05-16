import { Client, ClientEvents } from 'discord.js';

export interface IEvent {
  name: keyof ClientEvents;
  once?: boolean;
  execute: (client: Client, ...args: any[]) => Promise<void>;
} 