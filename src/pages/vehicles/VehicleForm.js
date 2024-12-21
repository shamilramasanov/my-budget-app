import { useState, useEffect } from 'react';

const VEHICLE_STATUSES = [
  'В експлуатації',
  'В ремонті',
  'На консервації',
  'Списано'
];

export default function VehicleForm({ vehicle, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    model: '',
    militaryNumber: '',
    vin: '',
    location: '',
    year: '',
    status: '',
    notes: '',
    contracts: []
  });
  const [availableContracts, setAvailableContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        model: vehicle.model || '',
        militaryNumber: vehicle.militaryNumber || '',
        vin: vehicle.vin || '',
        location: vehicle.location || '',
        year: vehicle.year?.toString() || '',
        status: vehicle.status || '',
        notes: vehicle.notes || '',
        contracts: vehicle.contracts?.map(c => c.id) || []
      });
    }
  }, [vehicle]);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contracts');
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }
      const data = await response.json();
      setAvailableContracts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? (value ? parseInt(value) : '') : value
    }));
  };

  const handleContractChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      contracts: selectedOptions
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Модель
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Військовий номер
          <input
            type="text"
            name="militaryNumber"
            value={formData.militaryNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          VIN-код
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Місцезнаходження
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Рік випуску
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Статус
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Оберіть статус</option>
            {VEHICLE_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Контракти
          {loading ? (
            <div>Завантаження контрактів...</div>
          ) : error ? (
            <div className="text-red-500">Помилка: {error}</div>
          ) : (
            <select
              multiple
              name="contracts"
              value={formData.contracts}
              onChange={handleContractChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              size="5"
            >
              {availableContracts.map(contract => (
                <option key={contract.id} value={contract.id}>
                  {contract.number} - {contract.name} ({contract.amount} грн)
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Утримуйте Ctrl (Cmd на Mac) для вибору декількох контрактів
          </p>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Примітки
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {vehicle ? 'Зберегти' : 'Створити'}
        </button>
      </div>
    </form>
  );
}
