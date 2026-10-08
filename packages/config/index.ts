import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

// Default configuration
const defaultConfig = {
  OLLAMA_BASE_URL: 'http://127.0.0.1:11434',
  DATA_DIR: './data',
  LOG_DIR: './logs',
  LOG_LEVEL: 'INFO',
  DEBUG: false,
};

// Configuration interface
interface Config {
  OLLAMA_BASE_URL: string;
  DATA_DIR: string;
  LOG_DIR: string;
  LOG_LEVEL: string;
  DEBUG: boolean;
}

// Create configuration object
const config: Config = {
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || defaultConfig.OLLAMA_BASE_URL,
  DATA_DIR: process.env.DATA_DIR || defaultConfig.DATA_DIR,
  LOG_DIR: process.env.LOG_DIR || defaultConfig.LOG_DIR,
  LOG_LEVEL: process.env.LOG_LEVEL || defaultConfig.LOG_LEVEL,
  DEBUG: process.env.DEBUG === 'true' || defaultConfig.DEBUG,
};

export default config;
