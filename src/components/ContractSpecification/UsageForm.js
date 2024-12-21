// src/components/ContractSpecification/UsageForm.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';

export default function UsageForm({ specification, onSubmit, onCancel }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      quantityUsed: '',
      description: '',
      documentNumber: ''
    }
  });

  const quantityUsed = watch('quantityUsed');
  const totalPrice = React.useMemo(() => {
    const quantity = parseFloat(quantityUsed) || 0;
    return quantity * specification.pricePerUnit;
  }, [quantityUsed, specification.pricePerUnit]);

  const submitHandler = (data) => {
    onSubmit({
      quantityUsed: parseFloat(data.quantityUsed),
      description: data.description,
      documentNumber: data.documentNumber,
      date: new Date(),
      totalPrice: totalPrice
    });
  };

  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle>Реєстрація використання</DialogTitle>
      </DialogHeader>

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900">{specification.itemName}</h4>
        <p className="text-sm text-gray-500">
          Доступний залишок: {specification.remaining} {specification.unit}
        </p>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Кількість
          </label>
          <input
            {...register("quantityUsed", {
              required: "Обов'язкове поле",
              min: { value: 0.01, message: "Має бути більше 0" },
              max: { 
                value: specification.remaining, 
                message: "Перевищує доступний залишок" 
              }
            })}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.quantityUsed && (
            <p className="mt-1 text-sm text-red-600">{errors.quantityUsed.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Опис виконаних робіт/наданих послуг
          </label>
          <textarea
            {...register("description", { required: "Обов'язкове поле" })}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Детальний опис виконаних робіт або наданих послуг"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Номер акту/накладної
          </label>
          <input
            {...register("documentNumber", { required: "Обов'язкове поле" })}
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Наприклад: Акт №123 від 15.12.2024"
          />
          {errors.documentNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.documentNumber.message}</p>
          )}
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Сума використання
          </label>
          <p className="text-lg font-semibold text-gray-900">
            {totalPrice.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} грн
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Скасувати
            </button>
          </DialogClose>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Зберегти
          </button>
        </div>
      </form>
    </div>
  );
}