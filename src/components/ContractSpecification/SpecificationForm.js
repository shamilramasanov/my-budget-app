// src/components/ContractSpecification/SpecificationForm.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';

export default function SpecificationForm({ specification, onSubmit, onCancel }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: specification || {
      itemName: '',
      quantity: '',
      unit: '',
      pricePerUnit: '',
    }
  });

  const quantity = watch('quantity');
  const pricePerUnit = watch('pricePerUnit');
  const totalPrice = React.useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(pricePerUnit) || 0;
    return q * p;
  }, [quantity, pricePerUnit]);

  const submitHandler = (data) => {
    onSubmit({
      id: specification?.id || Date.now().toString(),
      itemName: data.itemName,
      quantity: parseFloat(data.quantity),
      unit: data.unit,
      pricePerUnit: parseFloat(data.pricePerUnit),
      totalPrice: totalPrice,
      remaining: parseFloat(data.quantity), // При створенні залишок дорівнює кількості
      usageHistory: specification?.usageHistory || []
    });
  };

  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle>
          {specification ? 'Редагувати позицію' : 'Нова позиція специфікації'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Найменування
          </label>
          <input
            {...register("itemName", { 
              required: "Обов'язкове поле" 
            })}
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Назва товару або послуги"
          />
          {errors.itemName && (
            <p className="mt-1 text-sm text-red-600">{errors.itemName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Кількість
            </label>
            <input
              {...register("quantity", { 
                required: "Обов'язкове поле",
                min: { value: 0.01, message: "Має бути більше 0" }
              })}
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Одиниця виміру
            </label>
            <select
              {...register("unit", { required: "Оберіть одиницю виміру" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Оберіть...</option>
              <option value="шт">шт</option>
              <option value="послуга">послуга</option>
              <option value="комплект">комплект</option>
              <option value="година">година</option>
              <option value="метр">метр</option>
              <option value="кг">кг</option>
            </select>
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ціна за одиницю (грн)
          </label>
          <input
            {...register("pricePerUnit", { 
              required: "Обов'язкове поле",
              min: { value: 0.01, message: "Має бути більше 0" }
            })}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.pricePerUnit && (
            <p className="mt-1 text-sm text-red-600">{errors.pricePerUnit.message}</p>
          )}
        </div>

        {/* Відображення загальної суми */}
        <div className="bg-gray-50 p-3 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Загальна сума
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
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            {specification ? 'Зберегти зміни' : 'Додати'}
          </button>
        </div>
      </form>
    </div>
  );
}