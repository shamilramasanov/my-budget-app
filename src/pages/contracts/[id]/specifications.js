import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../shared/components/Layout';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Table } from '../../../shared/components/ui/Table';
import { colors } from '../../../core/theme/colors';
import { formatMoney, formatNumber } from '../../../shared/utils/format';
import prisma from '../../../lib/prisma';
import { toast } from 'react-toastify';

export default function SpecificationsPage({ contract, specifications }) {
  const router = useRouter();
  const { id: contractId } = router.query;
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [specs, setSpecs] = useState(specifications);
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    {
      key: 'name',
      title: 'Назва',
      className: 'w-1/3',
    },
    {
      key: 'unit',
      title: 'Од. вим.',
      className: 'w-1/12',
    },
    {
      key: 'quantity',
      title: 'Кількість',
      className: 'text-right w-1/12',
      render: (value) => formatNumber(value),
    },
    {
      key: 'price',
      title: 'Ціна',
      className: 'text-right w-1/6',
      render: (value) => formatMoney(value),
    },
    {
      key: 'amount',
      title: 'Сума',
      className: 'text-right w-1/6',
      render: (value) => formatMoney(value),
    },
  ];

  const totalAmount = specs.reduce((sum, spec) => sum + spec.amount, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target);
    const data = {
      name: formData.get('name'),
      unit: formData.get('unit'),
      quantity: parseFloat(formData.get('quantity')),
      price: parseFloat(formData.get('price')),
      amount: parseFloat(formData.get('quantity')) * parseFloat(formData.get('price')),
      description: formData.get('description'),
    };

    try {
      const response = await fetch(`/api/contracts/${contract.id}/specifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create specification');

      const newSpec = await response.json();
      setSpecs(prev => [...prev, newSpec]);
      toast.success('Специфікацію успішно додано!');
      event.target.reset();
    } catch (error) {
      toast.error('Помилка при створенні специфікації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Информация о договоре */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-[${colors.neutral[900]}] mb-4">
              {contract.name}
            </h2>
            <div className="space-y-2 text-[${colors.neutral[600]}]">
              <p>Договір №: {contract.number}</p>
              <p>Клієнт: {contract.client}</p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center">
            <p className="text-sm text-[${colors.neutral[600]}]">Загальна сума договору</p>
            <p className="text-3xl font-semibold text-[${colors.neutral[900]}]">
              {formatMoney(contract.amount)}
            </p>
          </div>
        </div>
      </Card>

      {/* Форма добавления спецификации */}
      {isAddingSpec && (
        <Card className="mb-6">
          <h3 className="text-lg font-medium text-[${colors.neutral[900]}] mb-4">
            Нова специфікація
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Input label="Назва" placeholder="Введіть назву" name="name" />
              </div>
              <div>
                <Input label="Од. вим." placeholder="шт." name="unit" />
              </div>
              <div>
                <Input label="Кількість" type="number" placeholder="0" name="quantity" />
              </div>
              <div>
                <Input label="Ціна" type="number" placeholder="0.00" name="price" />
              </div>
              <div className="lg:col-span-5">
                <Input label="Опис" placeholder="Введіть опис" name="description" />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setIsAddingSpec(false)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Таблица спецификаций */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-[${colors.neutral[900]}]">
            Специфікації
          </h3>
          {!isAddingSpec && (
            <Button onClick={() => setIsAddingSpec(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Додати специфікацію
            </Button>
          )}
        </div>

        <Table columns={columns} data={specs} />

        {/* Итоговая сумма */}
        <div className="mt-6 flex justify-end">
          <div className="bg-[${colors.neutral[50]}] rounded-lg px-6 py-4">
            <p className="text-sm text-[${colors.neutral[600]}]">Загальна сума специфікацій</p>
            <p className="text-2xl font-semibold text-[${colors.neutral[900]}]">
              {formatMoney(totalAmount)}
            </p>
          </div>
        </div>
      </Card>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        specifications: true,
      },
    });

    if (!contract) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        contract: JSON.parse(JSON.stringify(contract)),
        specifications: JSON.parse(JSON.stringify(contract.specifications)),
      },
    };
  } catch (error) {
    console.error('Error fetching contract:', error);
    return {
      notFound: true,
    };
  }
}
