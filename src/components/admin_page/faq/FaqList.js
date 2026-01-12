// src/components/admin/faq/FaqList.js
import React, { useState, useEffect } from 'react';
import styles from './FaqList.module.css';
import FaqForm from './FaqForm';
import ConfirmDialog from '../shared/ConfirmDialog';

const API_URL = '/api/admin/faq';

export default function FaqList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // ← состояние подтверждения

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError('Не удалось загрузить проекты');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDeleteClick = (id) => {
    setConfirmId(id); // ← показать диалог
  };

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    try {
      await fetch(`${API_URL}/${confirmId}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== confirmId));
    } catch (err) {
      alert('Ошибка удаления');
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Вопросы и ответы</h1>
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
            onSave={() => {
              setEditingId(null);
              fetchItems();
            }}
            onCancel={() => setEditingId(null)}
          />
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