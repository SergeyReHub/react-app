// src/components/admin/leads/LeadList.js

import React, { useState, useEffect } from 'react';
import styles from './LeadList.module.css';
import ConfirmDialog from '../shared/ConfirmDialog';
import { API_BASE_URL } from '../../../config/config';
import { useAuth } from '../../../context/AuthContext';

const LEADS_API = `${API_BASE_URL}/api/admin/leads`;

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmRejectId, setConfirmRejectId] = useState(null);
  const [viewMode, setViewMode] = useState('moderation'); // 'moderation' | 'accepted'
  const { authToken } = useAuth();

  const currentStatus = viewMode === 'moderation' ? 'DONE' : 'ACCEPTED';

  useEffect(() => {
    fetchLeads();
  }, [viewMode]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Используем query-параметр status
      const res = await fetch(`${LEADS_API}/by_status?status=${currentStatus}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.content || []);
      setLeads(items);
    } catch (err) {
      console.error('Failed to load leads', err);
      setError('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, status) => {
    try {
      const res = await fetch(`${LEADS_API}/set_status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId, status })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Убираем из списка после модерации (только в режиме модерации)
      if (viewMode === 'moderation') {
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
      } else {
        // В режиме просмотра — обновляем статус (маловероятно, но на всякий)
        setLeads(prev =>
          prev.map(lead => (lead.id === leadId ? { ...lead, status } : lead))
        );
      }
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      alert('Не удалось обновить статус заявки');
    }
  };

  const handleAccept = (id) => {
    updateLeadStatus(id, 'ACCEPTED');
  };

  const handleRejectClick = (id) => {
    setConfirmRejectId(id);
  };

  const handleRejectConfirm = () => {
    if (!confirmRejectId) return;
    updateLeadStatus(confirmRejectId, 'REJECTED');
    setConfirmRejectId(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${viewMode === 'moderation' ? styles.activeTab : ''}`}
          onClick={() => setViewMode('moderation')}
        >
          🕵️ Модерация (DONE)
        </button>
        <button
          className={`${styles.tab} ${viewMode === 'accepted' ? styles.activeTab : ''}`}
          onClick={() => setViewMode('accepted')}
        >
          ✅ Одобрённые (ACCEPTED)
        </button>
      </div>

      <h1>
        {viewMode === 'moderation' ? 'Заявки на модерацию' : 'Одобренные заявки'}
      </h1>

      {loading ? (
        <div className={styles.loader}>Загрузка...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : leads.length === 0 ? (
        <p className={styles.empty}>
          {viewMode === 'moderation'
            ? 'Нет заявок для модерации'
            : 'Нет одобренных заявок'}
        </p>
      ) : (
        <div className={styles.list}>
          {leads.map((lead) => (
            <div key={lead.id} className={styles.leadCard}>
              <div className={styles.field}>
                <strong>Имя: </strong>
                <p>{lead.fullName}</p>
              </div>
              <div className={styles.field}>
                <strong>Email: </strong> 
                <p>{lead.email}</p>
              </div>
              <div className={styles.field}>
                <strong>Телефон: </strong> 
                <p>{lead.phone}</p>
              </div>
              {lead.message && (
                <div className={styles.field}>
                  <strong>Сообщение: </strong> 
                  <p>{lead.message}</p>
                </div>
              )}
              <div className={styles.field}>
                <strong>Статус:</strong> 
                <p>{lead.status}</p>

              </div>

              {/* Кнопки только в режиме модерации */}
              {viewMode === 'moderation' && (
                <div className={styles.actions}>
                  <button
                    className={styles.btnAccept}
                    onClick={() => handleAccept(lead.id)}
                  >
                    ✅ Принять
                  </button>
                  <button
                    className={styles.btnReject}
                    onClick={() => handleRejectClick(lead.id)}
                  >
                    ❌ Отклонить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmRejectId}
        title="Отклонить заявку?"
        message="Вы уверены, что хотите отклонить эту заявку? Действие нельзя отменить."
        onConfirm={handleRejectConfirm}
        onCancel={() => setConfirmRejectId(null)}
      />
    </div>
  );
}