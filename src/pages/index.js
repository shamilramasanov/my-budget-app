import React, { useState } from 'react';
import { Card } from '../shared/components/ui/Card';
import { formatMoney } from '../shared/utils/format';
import prisma from '../lib/prisma';
import styles from './HomePage.module.css';

export default function HomePage({ budgets = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Загальний фонд',
    date: new Date().toISOString().split('T')[0],
    kekv: [{ code: '2210', plannedAmount: '' }]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to create budget');
      
      window.location.reload();
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Помилка при створенні кошторису');
    }
  };

  const deleteBudget = async (id) => {
    if (!confirm('Ви впевнені, що хочете видалити цей кошторис?')) return;
    
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete budget');
      
      window.location.reload();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Помилка при видаленні кошторису');
    }
  };

  const addKekv = () => {
    setFormData({
      ...formData,
      kekv: [...formData.kekv, { code: '2210', plannedAmount: '' }]
    });
  };

  const removeKekv = (index) => {
    setFormData({
      ...formData,
      kekv: formData.kekv.filter((_, i) => i !== index)
    });
  };

  const updateKekv = (index, field, value) => {
    const newKekv = [...formData.kekv];
    newKekv[index] = { ...newKekv[index], [field]: value };
    setFormData({ ...formData, kekv: newKekv });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Бюджетний менеджер</h1>
          <p className={styles.description}>Керуйте вашими кошторисами ефективно</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.createButton}
        >
          + Створити кошторис
        </button>
      </header>

      {budgets.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>У вас поки немає кошторисів. Створіть перший!</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.createButton}
          >
            Створити кошторис
          </button>
        </div>
      ) : (
        <div className={styles.budgetGrid}>
          {budgets.map((budget) => (
            <Card key={budget.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>{budget.name}</h2>
                  <p className={styles.cardDate}>
                    {new Date(budget.date).toLocaleDateString('uk-UA')}
                  </p>
                </div>
                <span className={budget.totalAmount > budget.usedAmount ? styles.positive : styles.negative}>
                  {budget.totalAmount > budget.usedAmount ? '✓ В межах бюджету' : '⚠ Перевищення'}
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <dt className={styles.cardLabel}>Планова сума</dt>
                  <dd className={styles.cardValue}>
                    {formatMoney(budget.totalAmount, { currency: 'UAH', locale: 'uk-UA' })}
                  </dd>
                </div>
                <div className={styles.cardInfo}>
                  <dt className={styles.cardLabel}>Використано</dt>
                  <dd className={styles.cardValue}>
                    {formatMoney(budget.usedAmount, { currency: 'UAH', locale: 'uk-UA' })}
                  </dd>
                </div>
                <div className={styles.cardInfo}>
                  <dt className={styles.cardLabel}>Залишок</dt>
                  <dd className={`${styles.cardValue} ${budget.totalAmount - budget.usedAmount >= 0 ? styles.positive : styles.negative}`}>
                    {formatMoney(budget.totalAmount - budget.usedAmount, { currency: 'UAH', locale: 'uk-UA' })}
                  </dd>
                </div>
                <div className={styles.cardInfo}>
                  <dt className={styles.cardLabel}>Тип</dt>
                  <dd className={styles.cardValue}>{budget.type}</dd>
                </div>
              </div>

              {budget.kekv && budget.kekv.length > 0 && (
                <div className={styles.cardKekv}>
                  <h3 className={styles.cardKekvTitle}>КЕКВ</h3>
                  <div className={styles.cardKekvList}>
                    {budget.kekv.map((kekv) => (
                      <div key={kekv.id} className={styles.cardKekvItem}>
                        <span className={styles.cardKekvCode}>{kekv.code}</span>
                        <span className={styles.cardKekvValue}>
                          {formatMoney(kekv.plannedAmount - kekv.usedAmount, { currency: 'UAH', locale: 'uk-UA' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.cardActions}>
                <button
                  onClick={() => deleteBudget(budget.id)}
                  className={styles.deleteButton}
                >
                  Видалити
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Створення нового кошторису</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Назва кошторису</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Тип кошторису</label>
                <select
                  required
                  className={styles.select}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Загальний фонд">Загальний фонд</option>
                  <option value="Спеціальний фонд">Спеціальний фонд</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Дата кошторису</label>
                <input
                  type="date"
                  required
                  className={styles.input}
                  value={formData.date}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setFormData({ 
                      ...formData, 
                      date: e.target.value,
                      year: date.getFullYear()
                    });
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.formHeader}>
                  <label className={styles.label}>КЕКВ</label>
                  <button
                    type="button"
                    onClick={addKekv}
                    className={styles.addButton}
                  >
                    + Додати КЕКВ
                  </button>
                </div>
                
                {formData.kekv.map((kekv, index) => (
                  <div key={index} className={styles.kekvItem}>
                    <select
                      required
                      className={styles.select}
                      value={kekv.code}
                      onChange={(e) => updateKekv(index, 'code', e.target.value)}
                    >
                      <option value="2210">2210</option>
                      <option value="2240">2240</option>
                      <option value="3110">3110</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Планова сума"
                      required
                      min="0"
                      step="0.01"
                      className={styles.input}
                      value={kekv.plannedAmount}
                      onChange={(e) => updateKekv(index, 'plannedAmount', e.target.value)}
                    />
                    {formData.kekv.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKekv(index)}
                        className={styles.deleteButton}
                      >
                        Видалити
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelButton}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  Створити
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  const budgets = await prisma.budget.findMany({
    include: {
      kekv: true,
    },
  });

  return {
    props: {
      budgets: JSON.parse(JSON.stringify(budgets)),
    },
  };
}
