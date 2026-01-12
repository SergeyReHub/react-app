// src/components/admin/projects-flat/ProjectsFlatList.js
import React, { useState, useEffect } from 'react';
import styles from './ProjectsFlatList.module.css';
import ProjectFlatForm from './ProjectFlatForm';
import ConfirmDialog from '../shared/ConfirmDialog';

const API_URL = '/api/admin/projects-flat';

export default function ProjectsFlatList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [error, setError] = useState(null);

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
            await fetch(`/api/admin/.../${confirmId}`, { method: 'DELETE' });
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
                <h1>Фото-проекты</h1>
                <button className={styles.btnAdd} onClick={() => setEditingId('new')}>
                    + Новый проект
                </button>
            </div>

            {loading ? (
                <div className={styles.loader}>Загрузка...</div>
            ) : (
                <div className={styles.grid}>
                    {projects.map((project) => (
                        <div key={project.id} className={styles.card}>
                            <h3>{project.name}</h3>
                            <div className={styles.photosCount}>
                                {project.photos?.length || 0} фото
                            </div>
                            <div className={styles.cardActions}>
                                <button onClick={() => setEditingId(project.id)}>Редактировать</button>
                                <button className={styles.btnDelete} onClick={() => handleDeleteClick(project.id)}>
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
                    <ProjectFlatForm
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