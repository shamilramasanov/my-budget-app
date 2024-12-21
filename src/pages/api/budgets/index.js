import prisma from '../../../lib/prisma'
import { getOrCreateTestUser } from '../../../middleware/auth'

export default async function handle(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const budgets = await prisma.budget.findMany({
          include: {
            kekv: true,
            contracts: true,
          },
        })
        return res.json(budgets)

      case 'POST':
        try {
          const { name, type, date, description, kekv } = req.body;
          
          // Получаем или создаем тестового пользователя
          const user = await getOrCreateTestUser();
          
          // Получаем год из даты
          const budgetDate = new Date(date);
          const year = budgetDate.getFullYear();
          
          // Функция для получения названия КЕКВ
          const getKekvName = (code) => {
            switch (code) {
              case '2210':
                return 'Предмети, матеріали, обладнання та інвентар';
              case '2240':
                return 'Оплата послуг (крім комунальних)';
              case '3110':
                return 'Придбання обладнання і предметів довгострокового користування';
              default:
                return '';
            }
          };
          
          // Вычисляем общую сумму бюджета
          const totalAmount = kekv.reduce((sum, item) => sum + parseFloat(item.plannedAmount), 0);
          
          const budget = await prisma.budget.create({
            data: {
              name,
              type,
              year,
              date: budgetDate,
              description: description || '',
              totalAmount,
              usedAmount: 0,
              kekv: {
                create: kekv.map(item => ({
                  code: item.code,
                  name: getKekvName(item.code),
                  plannedAmount: parseFloat(item.plannedAmount),
                  usedAmount: 0
                }))
              },
              user: {
                connect: { id: user.id }
              }
            },
            include: {
              kekv: true
            }
          })
          return res.json(budget)
        } catch (error) {
          console.error('Error creating budget:', error)
          return res.status(500).json({ error: 'Error processing your request' })
        }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error processing your request' })
  }
}
