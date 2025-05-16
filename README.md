# PGER - Roblox Discord Bot

A feature-rich Discord bot for Roblox integration, built with TypeScript and Discord.js.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js->=16-green)](https://nodejs.org/)

## 🌟 Features

- **Roblox User Lookup** - Get detailed information about Roblox users
- **Bot Stats** - View statistics about the bot's performance
- **Utility Commands** - Various utility commands for server management
- **Scheduled Tasks** - Automated tasks using cron jobs

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB database
- Discord Bot Token
- Roblox API Access

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/pger.git
   cd pger
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   MONGODB_URI=your_mongodb_connection_string
   ROBLOX_COOKIE=your_roblox_cookie
   ```

4. Build the project
   ```bash
   npm run build
   ```

5. Start the bot
   ```bash
   npm start
   ```

### Docker Deployment

You can also run the bot using Docker:

```bash
docker-compose up -d
```

## 📚 Commands

| Command | Description |
|---------|-------------|
| `.user <username>` | Get information about a Roblox user |
| `.botstats` | View bot statistics |
| `.ping` | Check bot latency |
| `.help` | Display help information |
| `.invite` | Get bot invite link |

## 🛠️ Project Structure

```
pger/
├── dist/                # Compiled JavaScript files
├── src/                 # TypeScript source code
│   ├── commands/        # Bot commands
│   ├── events/          # Discord.js event handlers
│   ├── interfaces/      # TypeScript interfaces
│   ├── services/        # Core services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Application setup
│   └── index.ts         # Entry point
├── .env                 # Environment variables
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses ESLint and Prettier for code formatting. Please make sure your code follows these standards:

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Discord.js](https://discord.js.org/)
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/)

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/b8ll/pger/issues) on GitHub. 