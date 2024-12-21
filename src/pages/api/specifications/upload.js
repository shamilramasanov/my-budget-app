import formidable from 'formidable';
import ExcelJS from 'exceljs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Starting file upload processing...');

  const form = formidable({
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);
    console.log('Form parsed:', {
      fields,
      files: Object.keys(files),
    });

    const kekv = fields.kekv?.[0];
    const uploadType = fields.type?.[0] || 'withVAT';
    const file = files.file?.[0];

    if (!file) {
      console.error('No file found in request');
      return res.status(400).json({ message: 'Файл не знайдено' });
    }

    if (!file.mimetype?.includes('spreadsheet')) {
      console.error('Invalid file type:', file.mimetype);
      return res.status(400).json({ message: 'Будь ласка, завантажте файл Excel (.xlsx)' });
    }

    console.log('Processing file:', file.filepath);
    console.log('KEKV:', kekv);
    console.log('Upload type:', uploadType);

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(file.filepath);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      return res.status(400).json({ message: 'Помилка читання файлу Excel. Перевірте, що файл не пошкоджений.' });
    }

    const worksheet = workbook.getWorksheet('Специфікація');
    if (!worksheet) {
      console.error('Worksheet "Специфікація" not found in Excel file');
      return res.status(400).json({ message: 'Не знайдено лист "Специфікація" у файлі' });
    }

    console.log('Excel file loaded successfully');
    console.log('Worksheet rows count:', worksheet.rowCount);

    const specifications = [];
    let rowCount = 0;
    let currentSection = kekv === '2240' ? '' : 'Товари'; // Для КЕКВ 2240 секции определяются из файла
    
    // Пропускаем заголовок и читаем данные
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Пропускаем заголовок

      try {
        const firstCell = row.getCell(1).value?.toString().trim();
        
        // Для КЕКВ 2240 проверяем, является ли строка заголовком раздела
        if (kekv === '2240' && (firstCell === 'Послуги' || firstCell === 'Використані запчастини')) {
          currentSection = firstCell;
          console.log('Found section:', currentSection);
          return;
        }

        // Пропускаем пустые строки
        if (!firstCell) {
          return;
        }

        rowCount++;
        const spec = {
          section: currentSection,
          number: row.getCell(1).value?.toString().trim(),
          name: row.getCell(2).value?.toString().trim(),
          code: row.getCell(3).value?.toString().trim(),
          unit: row.getCell(4).value?.toString().trim(),
          quantity: parseFloat(row.getCell(5).value) || 0,
          price: parseFloat(row.getCell(6).value) || 0,
        };

        // Проверяем обязательные поля
        if (!spec.name || !spec.unit) {
          throw new Error(`Рядок ${rowNumber}: відсутня назва або одиниця виміру`);
        }

        if (kekv === '2240' && currentSection === 'Послуги') {
          spec.serviceCount = parseInt(row.getCell(7).value) || 1;
          spec.amount = spec.quantity * spec.price * spec.serviceCount;
        } else {
          spec.serviceCount = null;
          spec.amount = spec.quantity * spec.price;
        }

        // Проверяем корректность расчета amount
        if (isNaN(spec.amount)) {
          throw new Error(`Рядок ${rowNumber}: помилка розрахунку суми. Перевірте кількість та ціну.`);
        }

        specifications.push(spec);
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        throw new Error(`Помилка в рядку ${rowNumber}: ${error.message}`);
      }
    });

    if (specifications.length === 0) {
      return res.status(400).json({ message: 'Не знайдено жодної специфікації у файлі' });
    }

    console.log(`Successfully processed ${specifications.length} specifications`);
    return res.json({ specifications });

  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(400).json({ message: error.message });
  }
}
