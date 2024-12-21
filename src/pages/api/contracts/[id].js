import prisma from '../../../lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        const contract = await prisma.contract.findUnique({
          where: { id },
          include: {
            budget: true,
            kekv: true,
            specifications: true,
          },
        });

        if (!contract) {
          return res.status(404).json({ error: 'Договір не знайдено' });
        }

        return res.json(contract);

      case 'PUT':
        const updatedContract = await prisma.contract.update({
          where: { id },
          data: {
            title: req.body.title,
            number: req.body.number,
            content: req.body.content,
            startDate: new Date(req.body.startDate),
            amount: parseFloat(req.body.amount),
            status: req.body.status,
          },
        })
        return res.json(updatedContract)

      case 'DELETE':
        // Получаем договор с его спецификациями
        const existingContract = await prisma.contract.findUnique({
          where: { id },
          include: {
            budget: true,
            kekv: true,
            specifications: true,
          },
        });

        if (!existingContract) {
          return res.status(404).json({ error: 'Договір не знайдено' });
        }

        // Выполняем все операции в транзакции
        const result = await prisma.$transaction(async (prisma) => {
          // Удаляем спецификации
          await prisma.specification.deleteMany({
            where: { contractId: id },
          });

          // Обновляем использованные суммы в бюджете и КЕКВ
          await prisma.budget.update({
            where: { id: existingContract.budgetId },
            data: {
              usedAmount: {
                decrement: existingContract.amount,
              },
            },
          });

          await prisma.kEKV.update({
            where: { id: existingContract.kekvId },
            data: {
              usedAmount: {
                decrement: existingContract.amount,
              },
            },
          });

          // Удаляем сам договор
          const deletedContract = await prisma.contract.delete({
            where: { id },
          });

          return deletedContract;
        });

        return res.json(result);

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
