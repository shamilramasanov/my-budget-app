import { read, utils } from 'xlsx';
import prisma from '../../../lib/prisma';
import { getOrCreateTestUser } from '../../../middleware/auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handle(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting import process...');
    const user = await getOrCreateTestUser();
    const { data } = req.body;

    if (!data) {
      console.error('No data provided');
      return res.status(400).json({ error: 'No data provided' });
    }

    console.log('Converting base64 to buffer...');
    // Преобразуем base64 в буфер
    const base64Data = data.split(',')[1];
    if (!base64Data) {
      console.error('Invalid data format');
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log('Reading Excel file...');
    // Читаем Excel файл
    const workbook = read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

    console.log('Parsed Excel data:', jsonData);

    if (!jsonData || jsonData.length === 0) {
      console.error('No valid data found in Excel file');
      return res.status(400).json({ error: 'No valid data found in Excel file' });
    }

    // Преобразуем данные в формат для базы данных
    const vehicles = jsonData.map(row => {
      console.log('Processing row:', row);
      return {
        model: row['Модель'] || '',
        militaryNumber: row['Військовий номер'] || '',
        vin: row['Номер кузова'] || row['VIN'] || `generated-${Date.now()}-${Math.random()}`,
        location: row['Місцезнаходження'] || '',
        year: parseInt(row['Дата виготовлення']) || 2000,
        status: 'В експлуатації',
        notes: `Номер двигуна: ${row['Номер двигуна'] || 'Н/Д'}, Номер шасі: ${row['Номер шасі'] || 'Н/Д'}`,
        userId: user.id
      };
    });

    console.log('Processed vehicles:', vehicles);

    // Сохраняем в базу данных
    console.log('Saving to database...');
    const result = await Promise.all(
      vehicles.map(async vehicle => {
        // Проверяем существование VIN
        const existingVehicle = await prisma.vehicle.findUnique({
          where: { vin: vehicle.vin }
        });

        if (existingVehicle) {
          // Если автомобиль существует - обновляем
          return prisma.vehicle.update({
            where: { vin: vehicle.vin },
            data: vehicle
          });
        } else {
          // Если нет - создаем новый
          return prisma.vehicle.create({
            data: vehicle
          });
        }
      })
    );

    console.log('Import completed successfully');
    res.json({ success: true, count: result.length });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
}
