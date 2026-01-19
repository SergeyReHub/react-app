// src/components/admin/projects-360/Projects360List.js
import React, { useState, useEffect } from 'react';
import styles from './Projects360List.module.css';
import Project360Form from './Project360Form';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config/config';

const API_URL = API_BASE_URL + '/api/public/projects/360-view';

export default function Projects360List() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const { authToken } = useAuth();
  

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError('Не удалось загрузить проекты');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDeleteClick = (id) => {
    setConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    try {
      // Ваш код удаления (fetch DELETE)
      await fetch(`${API_BASE_URL}/api/admin/projects/360-view/${confirmId}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${authToken}` }});
      // Обновите состояние
      setProjects(projects.filter(i => i.id !== confirmId));
    } catch (err) {
      alert('Ошибка удаления');
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>360° Проекты</h1>
        <button
          className={styles.btnAdd}
          onClick={() => setEditingId('new')}
        >
          + Новый проект
        </button>
      </div>

      {loading && <div className={styles.loader}>Загрузка...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {editingId && (
        <div className={styles.formOverlay}>
          <Project360Form
            id={editingId}
            initialData={editingId === 'new' ? null : projects.find(p => p.id === editingId)}
            onSave={() => {
              setEditingId(null);
              fetchProjects();
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      <div className={styles.grid}>
        {projects.map((project) => (
          <div key={project.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{project.title || 'Без названия'}</h3>
              <div className={styles.cardMeta}>
                {project.nodes?.length || 0} точек
              </div>
            </div>
            <p className={styles.cardDesc}>{project.description?.slice(0, 80)}...</p>
            <div className={styles.cardActions}>
              <button
                className={styles.btnEdit}
                onClick={() => setEditingId(project.id)}
              >
                Редактировать
              </button>
              <button
                className={styles.btnDelete}
                onClick={() => handleDeleteClick(project.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={!!confirmId}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить этот элемент? Действие нельзя отменить."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}