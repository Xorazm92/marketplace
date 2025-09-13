import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Database connection successful!');
  
  // Check if User table exists and list its columns
  try {
    // @ts-ignore - Using raw query to check table structure
    const userTable = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user';
    `;
    console.log('\nUser table structure:');
    console.table(userTable);
  } catch (error) {
    console.error('Error checking User table:', error);
  }

  // Check if auth_method table exists
  try {
    // @ts-ignore - Using raw query to check table structure
    const authMethodTable = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'auth_method';
    `;
    console.log('\nAuthMethod table structure:');
    console.table(authMethodTable);
  } catch (error) {
    console.error('AuthMethod table does not exist or error:', error);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
