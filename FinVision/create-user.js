// create-user.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser() {
  try {
    const user = await prisma.users.create({
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'demo@expense.fyi',
        currency: 'USD',
        locale: 'en-US',
      },
    });
    console.log('User created successfully:', user);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('User already exists');
    } else {
      console.error('Error creating user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUser();