// src/components/admin/faq/FaqList.js
import React, { useState, useEffect } from 'react';
import styles from './FaqList.module.css';
import FaqForm from './FaqForm';
import ConfirmDialog from '../shared/ConfirmDialog';
import { API_BASE_URL } from '../../../config/config';
import { useAuth } from '../../../context/AuthContext';

const API_URL = `${API_BASE_URL}/api/admin/faqs`;
const ADMIN_API = `${API_BASE_URL}/api/admin/faqs`;
const PENDING_COUNT_URL = `${API_BASE_URL}/api/admin/faqs/pending/count`;

export default function FaqList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingState, setEditingState] = useState(null); // null | { id: ..., mode: 'edit' | 'moderation' }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const { authToken } = useAuth();

  useEffect(() => {
    fetchItems();
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(PENDING_COUNT_URL, {
        headers: { Authorization: `Bearer ${authToken}` },
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
      const res = await fetch(`${API_URL}?page=0&size=1000`, {method: 'GET', headers: { Authorization: `Bearer ${authToken}` },});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const faqs = Array.isArray(data) ? data : (data.content || []);
      console.log(faqs);
      setItems(faqs);
    } catch (err) {
      setError('Не удалось загрузить вопросы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => setConfirmDeleteId(id);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    try {
      await fetch(`${ADMIN_API}/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setItems(items.filter(i => i.id !== confirmDeleteId));
    } catch (err) {
      alert('Ошибка удаления');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleModerationClick = async () => {
    // Загружаем один элемент (можно сделать выбор, но для простоты — первый)
    try {
      const res = await fetch(`${ADMIN_API}/pending`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('No pending items');
      const pendingItems = await res.json();
      if (pendingItems.length === 0) {
        alert('Нет вопросов на модерации');
        return;
      }
      // Берём первый (или можно открыть список выбора — но по ТЗ: "в FaqForm")
      const item = pendingItems[0];
      console.log(item);
      setEditingState({ id: item.id, mode: 'moderation', data: item });
    } catch (err) {
      console.error('Failed to load pending item', err);
      alert('Не удалось загрузить вопрос на модерацию');
    }
  };

  const handleEdit = (id) => {
    setEditingState({ id, mode: 'edit', data: items.find(i => i.id === id) });
  };

  const handleCreate = () => {
    setEditingState({ id: 'new', mode: 'edit', data: null });
  };

  const handleFormClose = () => {
    setEditingState(null);
    fetchItems(); // обновляем основной список
    fetchPendingCount(); // обновляем счётчик
  };

  return (
    <div className={styles.page}>
      <h1>Вопросы и ответы</h1>
      <div className={styles.headerActions}>
        {pendingCount > 0 && (
          <button className={styles.btnModeration} onClick={handleModerationClick}>
            📬 Модерация ({pendingCount})
          </button>
        )}
        <button className={styles.btnAdd} onClick={handleCreate}>
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
                <button onClick={() => handleEdit(item.id)}>Редактировать</button>
                <button className={styles.btnDelete} onClick={() => handleDeleteClick(item.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}

      {editingState && (
        <div className={styles.overlay}>
          <FaqForm
            mode={editingState.mode}
            id={editingState.id}
            initialData={editingState.data}
            onClose={handleFormClose}
            authToken={authToken}
            adminApiUrl={ADMIN_API}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Удалить вопрос?"
        message="Вы уверены? Этот вопрос будет удалён из FAQ навсегда."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}