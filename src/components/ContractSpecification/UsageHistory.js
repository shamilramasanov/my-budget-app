// src/components/ContractSpecification/UsageHistory.js
import React from 'react';
import { X } from 'lucide-react';

export default function UsageHistory({ specification, onClose }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Історія використання</h3>
          <p className="mt-1 text-sm text-gray-500">{specification.itemName}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-3 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Загальна кількість:</span>
            <span className="ml-2 font-medium">{specification.quantity} {specification.unit}</span>
          </div>
          <div>
            <span className="text-gray-500">Залишок:</span>
            <span className={`ml-2 font-medium ${
              specification.remaining > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {specification.remaining} {specification.unit}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Ціна за одиницю:</span>
            <span className="ml-2 font-medium">
              {specification.pricePerUnit.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} грн
            </span>
          </div>
          <div>
            <span className="text-gray-500">Загальна сума:</span>
            <span className="ml-2 font-medium">
              {specification.totalPrice.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} грн
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Номер акту
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Опис
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Кількість
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Сума
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {specification.usageHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Історія використання відсутня
                </td>
              </tr>
            ) : (
              specification.usageHistory.map((usage, index) => (
                <tr key={usage.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(usage.date).toLocaleDateString('uk-UA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usage.documentNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {usage.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {usage.quantityUsed} {specification.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {(usage.quantityUsed * specification.pricePerUnit).toLocaleString('uk-UA', { 
                      minimumFractionDigits: 2 
                    })} грн
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {specification.usageHistory.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900">
                  Всього використано:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {specification.quantity - specification.remaining} {specification.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {((specification.quantity - specification.remaining) * specification.pricePerUnit)
                    .toLocaleString('uk-UA', { minimumFractionDigits: 2 })} грн
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}