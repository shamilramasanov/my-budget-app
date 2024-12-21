import ExcelJS from 'exceljs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { kekv, type = 'withVAT' } = req.query;

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Специфікація');

    // Базовые колонки для всех КЕКВ
    const baseColumns = [
      { header: '№', key: 'number', width: 5 },
      { header: 'Найменування', key: 'name', width: 40 },
      { header: 'Код', key: 'code', width: 15 },
      { header: 'Од. вим.', key: 'unit', width: 10 },
      { header: 'К-сть', key: 'quantity', width: 10 },
      { header: 'Ціна', key: 'price', width: 12 },
      { header: 'Сума', key: 'total', width: 15 }
    ];

    // Дополнительные колонки для КЕКВ 2240
    const serviceColumns = [
      { header: 'К-сть обсл.', key: 'serviceCount', width: 12 },
      { header: 'Сума за обсл.', key: 'serviceAmount', width: 15 }
    ];

    // Устанавливаем колонки в зависимости от КЕКВ
    worksheet.columns = kekv === '2240' ? 
      [...baseColumns.slice(0, -1), ...serviceColumns, baseColumns[baseColumns.length - 1]] :
      baseColumns;

    // Стили для заголовка
    const headerStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      },
      font: {
        bold: true,
        size: 10
      },
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      }
    };

    // Применяем стили к заголовку
    worksheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });

    if (kekv === '2240') {
      // Для КЕКВ 2240 добавляем разделы услуг и запчастей
      // Добавляем раздел "Послуги"
      worksheet.addRow(['Послуги']);
      worksheet.getRow(worksheet.rowCount).font = { bold: true };
      worksheet.addRow(['1', 'Приклад послуги', '', 'норм/год', '1', '100.00', '1', '100.00', '100.00']);

      // Добавляем раздел "Використані запчастини"
      worksheet.addRow(['Використані запчастини']);
      worksheet.getRow(worksheet.rowCount).font = { bold: true };
      worksheet.addRow(['1', 'Приклад запчастини', 'ABC123', 'шт', '1', '100.00', '', '', '100.00']);
    } else {
      // Для других КЕКВ добавляем только пример товара
      worksheet.addRow(['1', 'Приклад товару', 'ABC123', 'шт', '1', '100.00', '100.00']);
    }

    // Устанавливаем числовой формат для колонок с ценами и суммами
    const priceColumns = kekv === '2240' ? ['F', 'H', 'I'] : ['F', 'G'];
    priceColumns.forEach(col => {
      worksheet.getColumn(col).numFmt = '#,##0.00';
    });

    // Устанавливаем числовой формат для колонки с количеством
    worksheet.getColumn('E').numFmt = '#,##0.00';
    if (kekv === '2240') {
      worksheet.getColumn('G').numFmt = '#,##0';
    }

    // Защита от редактирования формул
    worksheet.protect('', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: true,
      formatColumns: true,
      formatRows: true,
      insertColumns: true,
      insertRows: true,
      insertHyperlinks: true,
      deleteColumns: true,
      deleteRows: true,
      sort: true,
      autoFilter: true,
      pivotTables: true
    });

    // Отправляем файл
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=specification_template_${kekv}_${type}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Помилка при створенні шаблону' });
  }
}
