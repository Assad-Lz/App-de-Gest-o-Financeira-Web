import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  earlyAccess: true,
  studio: { port: 5555 },
  migrations: { schemaPath: 'prisma/schema.prisma' },
  datasource: {
    url: process.env.DATABASE_URL
  }
});
