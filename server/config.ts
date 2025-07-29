import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key',
  MONGODB_URI: process.env.MONGODB_URI || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  USE_MONGODB: process.env.USE_MONGODB === 'true',
  BCRYPT_SALT_ROUNDS: 10,
};