// src/pages/contracts/index.js

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { colors } from '../../core/theme/colors';
import { formatMoney, formatDate } from '../../shared/utils/format';
import { cn } from '../../utils/cn';
import prisma from '../../lib/prisma';
import Modal from '../../shared/components/Modal';
import ContractForm from './ContractForm';

export default function ContractsPage({ contracts: initialContracts = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contracts, setContracts] = useState(initialContracts);
  const router = useRouter();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const handleContractCreated = () => {
    setIsModalOpen(false);
    fetchContracts();
  };

  const handleDeleteContract = async (id, e) => {
    e.stopPropagation(); // Предотвращаем переход на страницу договора при клике на кнопку удаления
    
    if (!window.confirm('Ви впевнені, що хочете видалити цей договір?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contract');
      }

      // Обновляем список договоров после удаления
      setContracts(contracts.filter(contract => contract.id !== id));
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Помилка при видаленні договору');
    }
  };

  // Фильтруем контракты
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchTerm === '' || 
      contract.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Реєстр договорів</h1>
            <Link
              href="/contracts/new"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Новий договір
            </Link>
          </div>

          {/* Фильтры и поиск */}
          <Card className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Пошук за номером або назвою"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={
                    <svg 
                      className="w-5 h-5 text-gray-400" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  }
                />
              </div>
              <select 
                className={cn(
                  'block w-full px-4 py-2.5',
                  'bg-white rounded-lg',
                  'border border-gray-300',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                  'transition-colors duration-200'
                )}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Всі статуси</option>
                <option value="ACTIVE">Активні</option>
                <option value="COMPLETED">Завершені</option>
              </select>
            </div>
          </Card>

          {/* Таблица договоров */}
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    № договору
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Код ДК
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контрагент
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    КЕКВ
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сума
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дати
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    onClick={() => router.push(`/contracts/${contract.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.number}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {contract.dkCode}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {contract.contractor}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {contract.kekv?.code}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatMoney(contract.amount)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        contract.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status === 'ACTIVE' ? 'Активний' :
                         contract.status === 'COMPLETED' ? 'Завершений' :
                         contract.status === 'DRAFT' ? 'Чернетка' :
                         'Скасований'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => handleDeleteContract(contract.id, e)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg 
                          className="h-5 w-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Новий договір"
      >
        <ContractForm onSuccess={handleContractCreated} />
      </Modal>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        budget: true,
        kekv: true,
      },
    });

    // Преобразуем даты в строки для корректной сериализации
    const serializedContracts = contracts.map(contract => ({
      ...contract,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate.toISOString(),
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
      budget: {
        ...contract.budget,
        date: contract.budget.date.toISOString(),
        createdAt: contract.budget.createdAt.toISOString(),
        updatedAt: contract.budget.updatedAt.toISOString(),
      },
      kekv: {
        ...contract.kekv,
        createdAt: contract.kekv.createdAt.toISOString(),
        updatedAt: contract.kekv.updatedAt.toISOString(),
      }
    }));

    return {
      props: {
        contracts: serializedContracts,
      },
    };
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return {
      props: {
        contracts: [],
      },
    };
  }
}
