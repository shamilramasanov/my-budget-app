const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Создаем пользователя
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  // Создаем бюджет
  const budget = await prisma.budget.create({
    data: {
      name: 'Бюджет 2024',
      type: 'Загальний фонд',
      year: 2024,
      date: new Date('2024-01-01'),
      totalAmount: 1000000,
      userId: user.id,
    },
  });

  // Создаем КЕКВ
  const kekv2210 = await prisma.kEKV.create({
    data: {
      code: '2210',
      name: 'Предмети, матеріали, обладнання та інвентар',
      plannedAmount: 500000,
      budgetId: budget.id,
    },
  });

  const kekv2240 = await prisma.kEKV.create({
    data: {
      code: '2240',
      name: 'Оплата послуг (крім комунальних)',
      plannedAmount: 300000,
      budgetId: budget.id,
    },
  });

  // Создаем договор
  const contract = await prisma.contract.create({
    data: {
      number: '1/2024',
      name: 'Закупівля комп\'ютерного обладнання',
      dkCode: '30230000-0',
      dkName: 'Комп\'ютерне обладнання',
      contractor: 'ТОВ "Комп\'ютерний світ"',
      amount: 50000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'ACTIVE',
      budgetId: budget.id,
      kekvId: kekv2210.id,
      userId: user.id,
    },
  });

  // Создаем спецификации
  await prisma.specification.create({
    data: {
      name: "Ноутбук HP ProBook",
      code: "HP-PB-450-G8",
      unit: "шт",
      quantity: 2,
      price: 15000,
      amount: 30000,
      contractId: contract.id
    }
  });

  await prisma.specification.create({
    data: {
      name: "Монітор Dell P2422H",
      code: "DELL-P2422H",
      unit: "шт",
      quantity: 2,
      price: 8000,
      amount: 16000,
      contractId: contract.id
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
