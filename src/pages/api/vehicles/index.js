import prisma from '../../../lib/prisma';
import { getOrCreateTestUser } from '../../../middleware/auth';

export default async function handle(req, res) {
  try {
    const user = await getOrCreateTestUser();

    switch (req.method) {
      case 'GET':
        const { search } = req.query;

        const vehicles = await prisma.vehicle.findMany({
          where: {
            userId: user.id,
            OR: search ? [
              { model: { contains: search } },
              { militaryNumber: { contains: search } },
              { vin: { contains: search } },
              { location: { contains: search } }
            ] : undefined
          },
          include: {
            contracts: {
              select: {
                id: true,
                number: true,
                name: true,
                amount: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        
        return res.json(vehicles);

      case 'POST':
        const { contracts: contractIds, ...vehicleData } = req.body;
        
        const newVehicle = await prisma.vehicle.create({
          data: {
            ...vehicleData,
            userId: user.id,
            contracts: {
              connect: contractIds ? contractIds.map(id => ({ id })) : []
            }
          },
          include: {
            contracts: {
              select: {
                id: true,
                number: true,
                name: true,
                amount: true
              }
            }
          }
        });

        return res.json(newVehicle);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
