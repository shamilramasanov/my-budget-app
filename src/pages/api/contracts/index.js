import prisma from '../../../lib/prisma'
import { getOrCreateTestUser } from '../../../middleware/auth'

export default async function handle(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const contracts = await prisma.contract.findMany({
          include: {
            budget: true,
            kekv: true,
            specifications: true,
          },
        })
        return res.json(contracts)

      case 'POST':
        const user = await getOrCreateTestUser();
        const { 
          number, 
          dkCode, 
          dkName, 
          contractor, 
          amount,
          startDate, 
          endDate, 
          budgetId, 
          kekvId, 
          specifications 
        } = req.body;

        // Проверяем корректность суммы
        if (isNaN(amount) || amount <= 0) {
          return res.status(400).json({ 
            error: 'Некоректна сума договору. Перевірте суми в специфікації.' 
          });
        }

        // Создаем договор в транзакции
        const contract = await prisma.$transaction(async (prisma) => {
          // Проверяем доступные суммы в бюджете и КЕКВ
          const budget = await prisma.budget.findUnique({
            where: { id: budgetId }
          });
          const kekv = await prisma.kEKV.findUnique({
            where: { id: kekvId }
          });

          if (!budget || !kekv) {
            throw new Error('Не знайдено бюджет або КЕКВ');
          }

          const availableBudgetAmount = budget.totalAmount - budget.usedAmount;
          const availableKekvAmount = kekv.plannedAmount - kekv.usedAmount;

          if (amount > availableBudgetAmount) {
            throw new Error(`Сума договору перевищує доступну суму в бюджеті (${availableBudgetAmount.toFixed(2)} грн)`);
          }

          if (amount > availableKekvAmount) {
            throw new Error(`Сума договору перевищує доступну суму в КЕКВ (${availableKekvAmount.toFixed(2)} грн)`);
          }

          // Проверяем корректность спецификаций
          const specTotal = specifications.reduce((sum, spec) => {
            const specAmount = spec.quantity * spec.price * (spec.serviceCount || 1);
            if (isNaN(specAmount)) {
              throw new Error(`Помилка розрахунку суми для специфікації "${spec.name}"`);
            }
            return sum + specAmount;
          }, 0);

          if (Math.abs(specTotal - amount) > 0.01) {
            throw new Error('Сума специфікацій не співпадає з сумою договору');
          }

          // Создаем договор
          const newContract = await prisma.contract.create({
            data: {
              number,
              name: dkName,
              dkCode,
              dkName,
              contractor,
              amount,
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              status: 'ACTIVE',
              budget: {
                connect: { id: budgetId }
              },
              kekv: {
                connect: { id: kekvId }
              },
              user: {
                connect: { id: user.id }
              },
              specifications: {
                create: specifications.map(spec => ({
                  name: spec.name,
                  code: spec.code,
                  unit: spec.unit,
                  quantity: spec.quantity,
                  price: spec.price,
                  amount: spec.quantity * spec.price * (spec.serviceCount || 1),
                  section: spec.section,
                  serviceCount: spec.serviceCount
                }))
              }
            },
            include: {
              budget: true,
              kekv: true,
              specifications: true
            }
          });

          // Обновляем использованные суммы в бюджете и КЕКВ
          await prisma.budget.update({
            where: { id: budgetId },
            data: { usedAmount: { increment: amount } }
          });

          await prisma.kEKV.update({
            where: { id: kekvId },
            data: { usedAmount: { increment: amount } }
          });

          return newContract;
        });

        return res.json(contract);

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
