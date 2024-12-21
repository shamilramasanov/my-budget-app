import prisma from '../../../lib/prisma';
import { getOrCreateTestUser } from '../../../middleware/auth';

export default async function handle(req, res) {
  const { id } = req.query;
  const user = await getOrCreateTestUser();

  try {
    switch (req.method) {
      case 'GET':
        const vehicle = await prisma.vehicle.findUnique({
          where: { id },
          include: {
            contracts: {
              include: {
                specifications: true,
                kekv: true
              }
            }
          }
        });

        if (!vehicle) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }

        return res.json(vehicle);

      case 'PUT':
        const { contracts: contractIds, ...vehicleData } = req.body;
        
        const updatedVehicle = await prisma.vehicle.update({
          where: { id },
          data: {
            ...vehicleData,
            contracts: {
              set: contractIds ? contractIds.map(id => ({ id })) : []
            }
          },
          include: {
            contracts: {
              include: {
                specifications: true,
                kekv: true
              }
            }
          }
        });

        return res.json(updatedVehicle);

      case 'DELETE':
        await prisma.vehicle.delete({
          where: { id }
        });

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
