const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function test() {
  console.log('🔗 Testando CRUD no Supabase...');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão OK!');
    
    const user = await prisma.user.upsert({
      where: { email: 'teste@fineasy.com' },
      update: { name: 'FinEasy Teste' },
      create: { email: 'teste@fineasy.com', name: 'FinEasy Teste', provider: 'email' }
    });
    console.log('✅ User upsert OK:', user.email);
    
    const tx = await prisma.transaction.create({
      data: { userId: user.id, type: 'INCOME', amount: 1000, category: 'Teste' }
    });
    console.log('✅ Transaction criada:', tx.id);
    
    const count = await prisma.user.count();
    console.log('✅ Total users no banco:', count);
    console.log('\n🎉 Supabase CRUD funcionando com sucesso!');
  } catch(e) {
    console.error('❌ Erro:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
