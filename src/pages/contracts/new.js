import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import SpecificationUpload from '@/components/SpecificationUpload';
import DkCodeAutocomplete from '@/components/DkCodeAutocomplete';

export default function NewContract() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedKekv, setSelectedKekv] = useState('');
  const [specifications, setSpecifications] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [kekvs, setKekvs] = useState([]);
  const [formData, setFormData] = useState({
    number: '',
    dk: null,
    contractor: '',
    amount: '0',
    startDate: '',
    endDate: ''
  });

  // Загрузка бюджетов при монтировании компонента
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch('/api/budgets');
        if (!response.ok) throw new Error('Failed to fetch budgets');
        const data = await response.json();
        setBudgets(data);
      } catch (err) {
        setError('Помилка завантаження кошторисів');
        console.error('Error fetching budgets:', err);
      }
    };

    fetchBudgets();
  }, []);

  // Загрузка КЕКВ при выборе бюджета
  useEffect(() => {
    const fetchKekvs = async () => {
      if (!selectedBudget) {
        setKekvs([]);
        return;
      }

      try {
        const response = await fetch(`/api/budgets/${selectedBudget}/kekvs`);
        if (!response.ok) throw new Error('Failed to fetch KEKVs');
        const data = await response.json();
        setKekvs(data);
      } catch (err) {
        setError('Помилка завантаження КЕКВ');
        console.error('Error fetching KEKVs:', err);
      }
    };

    fetchKekvs();
  }, [selectedBudget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Рассчитываем суммы для каждой спецификации
      const updatedSpecifications = specifications.map(spec => ({
        ...spec,
        amount: spec.quantity * spec.price * (spec.serviceCount || 1)
      }));

      const totalAmount = updatedSpecifications.reduce((sum, spec) => sum + spec.amount, 0);
      
      const contractData = {
        number: formData.number,
        dkCode: formData.dk?.code,
        dkName: formData.dk?.name,
        contractor: formData.contractor,
        amount: totalAmount,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budgetId: selectedBudget,
        kekvId: selectedKekv,
        specifications: updatedSpecifications
      };

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка при створенні договору');
      }

      router.push('/contracts');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Новий договір | My Budget App</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Новий договір</h1>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Назад
            </button>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {error && (
                <div className="bg-red-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Кошторис
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      required
                    >
                      <option value="">Оберіть кошторис</option>
                      {budgets.map((budget) => (
                        <option key={budget.id} value={budget.id}>
                          {budget.name} - {new Date(budget.date).toLocaleDateString()} 
                          (Доступно: {budget.totalAmount - budget.usedAmount} грн)
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    КЕКВ
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={selectedKekv}
                      onChange={(e) => setSelectedKekv(e.target.value)}
                      disabled={!selectedBudget}
                      required
                    >
                      <option value="">Оберіть КЕКВ</option>
                      {kekvs.map((kekv) => (
                        <option key={kekv.id} value={kekv.id}>
                          {kekv.code} - {kekv.name} 
                          (Доступно: {kekv.plannedAmount - kekv.usedAmount} грн)
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {selectedKekv && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Специфікація</h3>
                    <SpecificationUpload
                      kekv={kekvs.find(k => k.id === selectedKekv)?.code}
                      onSpecificationsLoaded={setSpecifications}
                    />
                    
                    {specifications.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Завантажені позиції:</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th className="px-4 py-2 text-left">№</th>
                                  <th className="px-4 py-2 text-left">Найменування</th>
                                  <th className="px-4 py-2 text-left">Код</th>
                                  <th className="px-4 py-2 text-left">Од. вим.</th>
                                  <th className="px-4 py-2 text-right">К-сть</th>
                                  <th className="px-4 py-2 text-right">Ціна</th>
                                  {kekvs.find(k => k.id === selectedKekv)?.code === '2240' && (
                                    <>
                                      <th className="px-4 py-2 text-right">К-сть обсл.</th>
                                      <th className="px-4 py-2 text-right">Сума за обсл.</th>
                                    </>
                                  )}
                                  <th className="px-4 py-2 text-right">Сума</th>
                                </tr>
                              </thead>
                              <tbody>
                                {kekvs.find(k => k.id === selectedKekv)?.code === '2240' ? (
                                  // Отображение для КЕКВ 2240
                                  <>
                                    {/* Услуги */}
                                    {specifications.some(spec => spec.section === 'Послуги') && (
                                      <>
                                        <tr className="bg-gray-100">
                                          <td colSpan="9" className="px-4 py-2 font-medium">
                                            Послуги
                                          </td>
                                        </tr>
                                        {specifications
                                          .filter(spec => spec.section === 'Послуги')
                                          .map((spec, index) => (
                                            <tr key={`service-${index}`} className="hover:bg-gray-50">
                                              <td className="border px-4 py-2">{spec.number}</td>
                                              <td className="border px-4 py-2">{spec.name}</td>
                                              <td className="border px-4 py-2">{spec.code}</td>
                                              <td className="border px-4 py-2">{spec.unit}</td>
                                              <td className="border px-4 py-2 text-right">{spec.quantity}</td>
                                              <td className="border px-4 py-2 text-right">{spec.price.toFixed(2)}</td>
                                              <td className="border px-4 py-2 text-right">{spec.serviceCount}</td>
                                              <td className="border px-4 py-2 text-right">{(spec.quantity * spec.price * spec.serviceCount).toFixed(2)}</td>
                                              <td className="border px-4 py-2 text-right">{spec.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                      </>
                                    )}

                                    {/* Запчасти */}
                                    {specifications.some(spec => spec.section === 'Використані запчастини') && (
                                      <>
                                        <tr className="bg-gray-100">
                                          <td colSpan="9" className="px-4 py-2 font-medium">
                                            Використані запчастини
                                          </td>
                                        </tr>
                                        {specifications
                                          .filter(spec => spec.section === 'Використані запчастини')
                                          .map((spec, index) => (
                                            <tr key={`part-${index}`} className="hover:bg-gray-50">
                                              <td className="border px-4 py-2">{spec.number}</td>
                                              <td className="border px-4 py-2">{spec.name}</td>
                                              <td className="border px-4 py-2">{spec.code}</td>
                                              <td className="border px-4 py-2">{spec.unit}</td>
                                              <td className="border px-4 py-2 text-right">{spec.quantity}</td>
                                              <td className="border px-4 py-2 text-right">{spec.price.toFixed(2)}</td>
                                              <td className="border px-4 py-2 text-right">-</td>
                                              <td className="border px-4 py-2 text-right">-</td>
                                              <td className="border px-4 py-2 text-right">{spec.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                      </>
                                    )}
                                  </>
                                ) : (
                                  // Отображение для других КЕКВ (2210)
                                  specifications.map((spec, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="border px-4 py-2">{spec.number}</td>
                                      <td className="border px-4 py-2">{spec.name}</td>
                                      <td className="border px-4 py-2">{spec.code}</td>
                                      <td className="border px-4 py-2">{spec.unit}</td>
                                      <td className="border px-4 py-2 text-right">{spec.quantity}</td>
                                      <td className="border px-4 py-2 text-right">{spec.price.toFixed(2)}</td>
                                      <td className="border px-4 py-2 text-right">{spec.amount.toFixed(2)}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={kekvs.find(k => k.id === selectedKekv)?.code === '2240' ? "8" : "6"} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                    Загальна сума:
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                    {specifications.reduce((sum, spec) => sum + spec.amount, 0).toFixed(2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Сума договору
                    <input
                      type="text"
                      value={specifications.length > 0 
                        ? specifications.reduce((sum, spec) => sum + spec.amount, 0).toFixed(2)
                        : '0.00'}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-50"
                      readOnly
                    />
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    {specifications.length > 0 
                      ? '* Сума розрахована автоматично на основі специфікації'
                      : '* Завантажте специфікацію для розрахунку суми договору'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Номер договору
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Код ДК 021:2015
                    <DkCodeAutocomplete
                      value={formData.dk}
                      onChange={(value) => setFormData(prev => ({ ...prev, dk: value }))}
                      className="mt-1"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Контрагент
                    <input
                      type="text"
                      name="contractor"
                      value={formData.contractor}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Дата початку
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Дата закінчення
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={loading || specifications.length === 0}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    (loading || specifications.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Створення...
                    </span>
                  ) : (
                    'Створити договір'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
