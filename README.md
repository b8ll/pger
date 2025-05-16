# PGER - Roblox Discord Bot

A feature-rich Discord bot for Roblox integration, built with TypeScript and Discord.js.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js->=16-green)](https://nodejs.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB database
- Discord Bot Token
- Roblox API Access

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/b8ll/pger.git
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

## 📚 Commands

| Command | Description |
|---------|-------------|
| `.user <username>` | Get information about a Roblox user |
| `.botstats` | View bot statistics |
| `.ping` | Check bot latency |
| `.help` | Display help information |
| `.invite` | Get bot invite link |

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

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/b8ll/pger/issues) on GitHub. 