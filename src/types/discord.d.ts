import { Collection } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, ICommand>;
  }
} 