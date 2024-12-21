import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import VehicleForm from './VehicleForm';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const router = useRouter();

  // Загрузка всех автомобилей при монтировании
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Локальная фильтрация при изменении поискового запроса
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = vehicles.filter(vehicle => 
      vehicle.model?.toLowerCase().includes(term) ||
      vehicle.militaryNumber?.toLowerCase().includes(term) ||
      vehicle.vin?.toLowerCase().includes(term) ||
      vehicle.location?.toLowerCase().includes(term)
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vehicles');
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      const data = await response.json();
      setVehicles(data);
      setFilteredVehicles(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const response = await fetch('/api/vehicles/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: e.target.result }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to import vehicles');
          }

          const message = `Успішно імпортовано ${data.count} транспортних засобів`;
          alert(message);
          console.log(message);
          fetchVehicles(); // Перезагружаем список
        } catch (err) {
          console.error('Import error:', err);
          setError(err.message);
          alert(`Помилка імпорту: ${err.message}`);
        }
      };

      reader.onerror = (err) => {
        console.error('FileReader error:', err);
        setError('Error reading file');
        alert('Error reading file');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      alert('Error uploading file: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Ви впевнені, що хочете видалити цей транспортний засіб?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      fetchVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = selectedVehicle 
        ? `/api/vehicles/${selectedVehicle.id}`
        : '/api/vehicles';
      
      const method = selectedVehicle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save vehicle');
      }

      setShowForm(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Автомобільна техніка</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Імпорт з Excel
          </label>
          <button
            onClick={() => {
              setSelectedVehicle(null);
              setShowForm(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Додати транспортний засіб
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Пошук за моделлю, військовим номером, VIN або місцезнаходженням..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-4">Завантаження...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">Помилка: {error}</div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          {searchTerm ? 'Нічого не знайдено' : 'Немає доданих транспортних засобів'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Модель</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">В/Н</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Місце</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Рік</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Контракти</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Дії</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{vehicle.model}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{vehicle.militaryNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{vehicle.vin}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{vehicle.location}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{vehicle.year}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{vehicle.status}</td>
                  <td className="px-3 py-2">
                    {vehicle.contracts?.length > 0 ? (
                      <div className="text-xs space-y-0.5">
                        {vehicle.contracts.map(contract => (
                          <div key={contract.id} className="flex items-center space-x-1">
                            <span className="font-medium truncate">{contract.number}</span>
                            <span className="text-gray-500">{contract.amount.toLocaleString()} грн</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Немає</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-xs">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedVehicle ? 'Редагування автомобіля' : 'Додавання автомобіля'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedVehicle(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <VehicleForm
              vehicle={selectedVehicle}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedVehicle(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
