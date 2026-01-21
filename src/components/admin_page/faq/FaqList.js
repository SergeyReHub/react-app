// src/components/admin/faq/FaqList.js
import React, { useState, useEffect } from 'react';
import styles from './FaqList.module.css';
import FaqForm from './FaqForm';
import ConfirmDialog from '../shared/ConfirmDialog';
import { API_BASE_URL } from '../../../config/config';
import { useAuth } from '../../../context/AuthContext';


const API_URL = `${API_BASE_URL}/api/public/faqs`;
// page and size
const ADMIN_API = `${API_BASE_URL}/api/admin/faqs`;
const PENDING_COUNT_URL = `${API_BASE_URL}/api/admin/faqs/pending/count`;
const PENDING_LIST_URL = `${API_BASE_URL}/api/admin/faqs/pending`;

export default function FaqList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // ← состояние подтверждения
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingItems, setPendingItems] = useState([]);
  const [showPending, setShowPending] = useState(false); // показывать ли модерацию
  const { authToken } = useAuth();

  useEffect(() => {
    fetchItems();
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(
        PENDING_COUNT_URL,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
        });
      if (res.ok) {
        const { count } = await res.json();
        setPendingCount(count);
      }
    } catch (e) {
      console.error('Failed to fetch pending count', e);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?page=0&size=1000`); // или без page/size, если хотите всё
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Если бэкенд возвращает Page<T>, то данные в data.content
      const faqs = Array.isArray(data) ? data : (data.content || []);
      setItems(faqs);
    } catch (err) {
      setError('Не удалось загрузить вопросы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteClick = (id) => {
    setConfirmId(id); // ← показать диалог
  };

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/faqs/${confirmId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
        });
      setItems(items.filter(i => i.id !== confirmId));
    } catch (err) {
      alert('Ошибка удаления');
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className={styles.page}>
      <h1>Вопросы и ответы</h1>
      <div className={styles.headerActions}>
        {pendingCount > 0 && (
          <button
            className={styles.btnModeration}
            onClick={() => {
              setShowPending(true);
              // Загружаем список при открытии
              fetch(PENDING_LIST_URL, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${authToken}`
                },
              }
              )
                .then(res => res.json())
                .then(data => setPendingItems(data))
                .catch(console.error);
            }}
          >
            📬 Модерация ({pendingCount})
          </button>
        )}
        <button className={styles.btnAdd} onClick={() => setEditingId('new')}>
          + Новый вопрос
        </button>
      </div>

      {loading ? (
        <div className={styles.loader}>Загрузка...</div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.q}>{item.question}</div>
              <div
                className={styles.a}
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
              <div className={styles.actions}>
                <button onClick={() => setEditingId(item.id)}>Редактировать</button>
                <button className={styles.btnDelete} onClick={() => handleDeleteClick(item.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}

      {editingId && (
        <div className={styles.overlay}>
          <FaqForm
            id={editingId}
            initialData={editingId === 'new' ? null : items.find(i => i.id === editingId)}
            onSave={async (faqData) => {
              try {
                if (editingId === 'new') {
                  // Создание
                  const res = await fetch(`${ADMIN_API}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(faqData)
                  });
                  if (!res.ok) throw new Error('Failed to create FAQ');
                } else {
                  // Обновление
                  const res = await fetch(`${ADMIN_API}/${faqData.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(faqData)
                  });
                  if (!res.ok) throw new Error('Failed to update FAQ');
                }
                // Обновляем список
                setEditingId(null);
                fetchItems();
              } catch (err) {
                console.error(err);
                alert('Ошибка сохранения FAQ');
              }
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {showPending && (
        <div className={styles.overlay}>
          <div className={styles.moderationModal}>
            <div className={styles.modalHeader}>
              <h2>Модерация вопросов ({pendingCount})</h2>
              <button className={styles.closeBtn} onClick={() => setShowPending(false)}>×</button>
            </div>
            <div className={styles.pendingList}>
              {pendingItems.length === 0 ? (
                <p>Нет вопросов на модерации</p>
              ) : (
                pendingItems.map((item) => (
                  <div key={item.id} className={styles.pendingItem}>
                    <div className={styles.q}>{item.question}</div>
                    <div
                      className={styles.a}
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                    <div className={styles.moderationActions}>
                      <button
                        className={styles.btnApprove}
                        onClick={async () => {
                          await fetch(`${ADMIN_API}/${item.id}/approve`,
                            {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${authToken}`
                              },
                            });
                          setPendingItems(pendingItems.filter(i => i.id !== item.id));
                          setPendingCount(prev => prev - 1);
                          fetchItems(); // обновить основной список
                        }}
                      >
                        ✅ Одобрить
                      </button>
                      <button
                        className={styles.btnReject}
                        onClick={async () => {
                          await fetch(`${ADMIN_API}/${item.id}/reject`,
                            {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${authToken}`
                              },
                            });
                          setPendingItems(pendingItems.filter(i => i.id !== item.id));
                          setPendingCount(prev => prev - 1);
                        }}
                      >
                        ❌ Отклонить
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmId}
        title="Удалить вопрос?"
        message="Вы уверены? Этот вопрос будет удалён из FAQ навсегда."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}