import prisma from '../../../../../lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query; // id договора

  try {
    switch (req.method) {
      case 'GET':
        const specifications = await prisma.specification.findMany({
          where: { contractId: id },
          orderBy: { createdAt: 'asc' },
        });
        return res.json(specifications);

      case 'POST':
        // Проверяем существование договора
        const contract = await prisma.contract.findUnique({
          where: { id },
          include: { specifications: true },
        });

        if (!contract) {
          return res.status(404).json({ error: 'Договір не знайдено' });
        }

        // Получаем данные из запроса
        const { name, code, unit, quantity, price, section, serviceCount } = req.body;
        const amount = quantity * price * (serviceCount || 1);

        // Проверяем, не превышает ли сумма спецификаций сумму договора
        const currentTotal = contract.specifications.reduce((sum, spec) => sum + spec.amount, 0);
        if (currentTotal + amount > contract.amount) {
          return res.status(400).json({ error: 'Загальна сума специфікацій перевищує суму договору' });
        }

        // Создаем спецификацию
        const specification = await prisma.specification.create({
          data: {
            name,
            code,
            unit,
            quantity,
            price,
            amount,
            section,
            serviceCount,
            contractId: id,
          },
        });
        return res.json(specification);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error processing specification:', error);
    return res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
}
