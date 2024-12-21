// src/components/ContractSpecification/SpecificationTable.js
import React from 'react';
import { FileText, Edit, Trash } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';
import SpecificationForm from './SpecificationForm';
import UsageForm from './UsageForm';

export default function SpecificationTable({ 
  specifications, 
  onUpdate, 
  onDelete,
  onSelectSpec 
}) {
  const [editingSpec, setEditingSpec] = React.useState(null);
  const [addingUsage, setAddingUsage] = React.useState(null);

  const handleEditSubmit = (updatedSpec) => {
    onUpdate(updatedSpec);
    setEditingSpec(null);
  };

  const handleUsageSubmit = (specId, usageData) => {
    const spec = specifications.find(s => s.id === specId);
    if (!spec) return;

    const newUsage = {
      id: Date.now().toString(),
      ...usageData,
      date: new Date()
    };

    const updatedSpec = {
      ...spec,
      remaining: spec.remaining - usageData.quantityUsed,
      usageHistory: [...spec.usageHistory, newUsage]
    };

    onUpdate(updatedSpec);
    setAddingUsage(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Назва</th>
            <th className="px-4 py-2 text-left">Код</th>
            <th className="px-4 py-2 text-left">Од. виміру</th>
            <th className="px-4 py-2 text-right">Кількість</th>
            <th className="px-4 py-2 text-right">Ціна</th>
            <th className="px-4 py-2 text-right">Сума</th>
            <th className="px-4 py-2 text-center">Дії</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {specifications.map((spec) => (
            <tr key={spec.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{spec.name}</td>
              <td className="border px-4 py-2">{spec.code}</td>
              <td className="border px-4 py-2">{spec.unit}</td>
              <td className="border px-4 py-2 text-right">{spec.quantity}</td>
              <td className="border px-4 py-2 text-right">{spec.price.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} грн</td>
              <td className="border px-4 py-2 text-right">{spec.amount.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} грн</td>
              <td className="border px-4 py-2 text-right">
                <span className={`font-medium ${
                  spec.remaining > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {spec.remaining} {spec.unit}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setAddingUsage(spec)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Додати використання"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onSelectSpec(spec)}
                    className="text-purple-600 hover:text-purple-900"
                    title="Історія використання"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingSpec(spec)}
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Редагувати"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Видалити цю позицію?')) {
                        onDelete(spec.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                    title="Видалити"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Діалог редагування специфікації */}
      <Dialog open={!!editingSpec} onOpenChange={() => setEditingSpec(null)}>
        <DialogContent>
          <SpecificationForm
            specification={editingSpec}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingSpec(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Діалог додавання використання */}
      <Dialog open={!!addingUsage} onOpenChange={() => setAddingUsage(null)}>
        <DialogContent>
          <UsageForm
            specification={addingUsage}
            onSubmit={(data) => handleUsageSubmit(addingUsage.id, data)}
            onCancel={() => setAddingUsage(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}