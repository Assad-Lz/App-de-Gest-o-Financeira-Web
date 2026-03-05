import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function createTables() {
  console.log('🔗 Conectando ao Supabase via Pooler...');
  console.log('URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@'));

  try {
    // Testar conexão
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão estabelecida com sucesso!');

    // Criar tabelas via SQL raw (compatível com PgBouncer)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT,
        "name" TEXT NOT NULL,
        "provider" TEXT NOT NULL DEFAULT 'email',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Tabela User criada!');

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
    `;
    console.log('✅ Index único de email criado!');

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `;
    console.log('✅ Tabela Transaction criada!');

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "MarketAsset" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "symbol" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "changePerc" DOUBLE PRECISION,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MarketAsset_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Tabela MarketAsset criada!');

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "MarketAsset_symbol_key" ON "MarketAsset"("symbol")
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "EconomicIndicator" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "value" DOUBLE PRECISION NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EconomicIndicator_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Tabela EconomicIndicator criada!');

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "EconomicIndicator_name_key" ON "EconomicIndicator"("name")
    `;

    // Criar tabela de migração do Prisma para compatibilidade
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        id VARCHAR(36) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        finished_at TIMESTAMPTZ,
        migration_name VARCHAR(255) NOT NULL,
        logs TEXT,
        rolled_back_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        applied_steps_count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (id)
      )
    `;

    console.log('\n🎉 Banco de dados criado com sucesso! Todas as tabelas estão prontas no Supabase.');

    // Verificar tabelas criadas
    const tables = await prisma.$queryRaw<any[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    console.log('📋 Tabelas no banco:', tables.map((t: any) => t.tablename).join(', '));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
