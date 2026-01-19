// src/components/admin/projects-flat/ProjectFlatForm.js
import React, { useState, useRef, useEffect } from 'react';
import styles from './ProjectFlatForm.module.css';
import { API_BASE_URL } from '../../../config/config';
import FlatPreview from './FlatPreview'; // ← новый компонент
import { useAuth } from '../../../context/AuthContext';

const EMPTY_PROJECT = { name: '', photos: [] };

export default function ProjectFlatForm({ id, initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || EMPTY_PROJECT);
  const [dragActive, setDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false); // управление видимостью превью
  const fileInputRef = useRef(null);
  const { authToken } = useAuth();
  

  // Синхронизируем initialData при изменении (например, при редактировании)
  useEffect(() => {
    setFormData(initialData || EMPTY_PROJECT);
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      const files = Array.from(e.dataTransfer.files);
      uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));

    // ⚠️ В реальности здесь должен быть вызов API для загрузки файлов
    // Сейчас эмулируем URL — замените на реальный UploadFile + authToken
    const newPhotos = imageFiles.map((file) => ({
      id: Date.now() + Math.random().toString(36).slice(2),
      url: URL.createObjectURL(file), // ← временный URL для предпросмотра
      caption: file.name,
      file, // ← сохраняем файл для последующей загрузки
    }));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  const removePhoto = (photoId) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== photoId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: здесь нужно отправить файлы на сервер и получить постоянные URL
    // Пока оставим как есть, но в продакшене — заменить!

    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url =
        id === 'new'
          ? `${API_BASE_URL}/api/admin/projects/just-view`
          : `${API_BASE_URL}/api/admin/projects/just-view/${id}`;

      // Подготовка данных: убираем временные поля (file, blob URL)
      const payload = {
        ...formData,
        photos: formData.photos.map((p) => ({
          url: p.url.startsWith('blob:') ? p.caption : p.url, // ← временно! замените после загрузки
          caption: p.caption,
        })),
      };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(payload),
      });

      onSave();
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения');
    }
  };

  return (
    <div className={styles.formCard}>
      <h2>{id === 'new' ? 'Новый фото-проект' : 'Редактировать проект'}</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Название</label>
          <input name="name" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div className={styles.photosSection}>
          <div className={styles.photosHeader}>
            <h3>Фотографии ({formData.photos.length})</h3>

          </div>

          {/* Drag & Drop Zone */}
          <div
            className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept="image/*"
              onChange={handlePhotosChange}
            />
            <div>📁 Перетащите изображения сюда или кликните</div>
          </div>

          {/* Previews */}
          <div className={styles.photosGrid}>
            {formData.photos.map((photo) => (
              <div key={photo.id} className={styles.photoItem}>
                <img src={photo.url} alt={photo.caption} />
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      photos: prev.photos.map((p) =>
                        p.id === photo.id ? { ...p, caption: e.target.value } : p
                      ),
                    }))
                  }
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removePhoto(photo.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {formData.photos.length > 0 && (
          <button
            type="button"
            className={styles.previewBtn}
            onClick={() => setPreviewOpen(true)}
          >
            Предпросмотр
          </button>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn}>
            {id === 'new' ? 'Создать' : 'Сохранить'}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Отмена
          </button>
        </div>
      </form>

      {/* Модальное окно предпросмотра */}
      {previewOpen && (
        <FlatPreview
          photos={formData.photos}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}