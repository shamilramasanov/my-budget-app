import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatDate } from '../../utils/dateUtils';

export default function ContractDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/contracts/${id}`);
      if (!response.ok) {
        throw new Error('Помилка завантаження договору');
      }
      const data = await response.json();
      setContract(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цей договір?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contract');
      }

      router.push('/contracts');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;
  if (!contract) return <div>Договір не знайдено</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Шапка */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Договір №{contract.number}</h1>
            <div className="flex space-x-2">
              <Link
                href={`/contracts/${id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Редагувати
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>

        {/* Основна інформація */}
        <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Контрагент</p>
            <p className="font-medium">{contract.contractor}</p>
          </div>
          <div>
            <p className="text-gray-600">Сума</p>
            <p className="font-medium">{contract.amount?.toFixed(2)} грн</p>
          </div>
          <div>
            <p className="text-gray-600">Дата початку</p>
            <p className="font-medium">{formatDate(contract.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-600">Дата закінчення</p>
            <p className="font-medium">{formatDate(contract.endDate)}</p>
          </div>
          <div>
            <p className="text-gray-600">ДК</p>
            <p className="font-medium">{contract.dkCode} - {contract.dkName}</p>
          </div>
          <div>
            <p className="text-gray-600">КЕКВ</p>
            <p className="font-medium">{contract.kekv?.code} - {contract.kekv?.name}</p>
          </div>
        </div>

        {/* Специфікації */}
        <div className="px-6 py-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Специфікації</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50 text-xs">
                  <th className="px-3 py-2 text-left">Найменування</th>
                  <th className="px-3 py-2 text-left">Код</th>
                  <th className="px-3 py-2 text-right">Од.</th>
                  <th className="px-3 py-2 text-right">К-сть</th>
                  <th className="px-3 py-2 text-right">Ціна</th>
                  <th className="px-3 py-2 text-right">Сума</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {contract.specifications?.map((spec, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{spec.name}</td>
                    <td className="px-3 py-2">{spec.code}</td>
                    <td className="px-3 py-2 text-right">{spec.unit}</td>
                    <td className="px-3 py-2 text-right">{spec.quantity}</td>
                    <td className="px-3 py-2 text-right">{spec.price?.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{spec.amount?.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-semibold bg-gray-50">
                  <td colSpan="5" className="px-3 py-2 text-right">Загальна сума:</td>
                  <td className="px-3 py-2 text-right">{contract.amount?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
