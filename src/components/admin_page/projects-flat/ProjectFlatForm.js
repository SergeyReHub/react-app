// src/components/admin/projects-flat/ProjectFlatForm.js
import React, { useState, useRef, useEffect } from 'react';
import styles from './ProjectFlatForm.module.css';
import { API_BASE_URL } from '../../../config/config';
import FlatPreview from './FlatPreview';
import { useAuth } from '../../../context/AuthContext';
import { UploadFile } from '../../../utils/UploadFile';

const EMPTY_PROJECT = { name: '', photos: [] };

export default function ProjectFlatForm({ id, initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || EMPTY_PROJECT);
  const [dragActive, setDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { authToken } = useAuth();

  // Храним File объекты для новых фото (ещё не загружены)
  const [pendingFiles, setPendingFiles] = useState([]);

  useEffect(() => {
    setFormData(initialData || EMPTY_PROJECT);
    // При редактировании — сбрасываем pendingFiles
    if (initialData) {
      setPendingFiles([]);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = '';
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
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Добавляем файлы в память (не загружаем!)
  const addFiles = (files) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    const newPhotos = imageFiles.map(file => ({
      id: Date.now() + Math.random().toString(36).slice(2),
      file, // ← храним оригинал
      previewUrl: URL.createObjectURL(file), // ← для превью
      caption: file.name,
    }));

    setPendingFiles(prev => [...prev, ...newPhotos]);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  const removePhoto = (photoId) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== photoId),
    }));
    setPendingFiles(prev => prev.filter(p => p.id !== photoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Разделяем фото на "существующие" и "новые"
      const existingPhotos = [];
      const newPhotosToUpload = [];

      for (const photo of formData.photos) {
        if (photo.file) {
          newPhotosToUpload.push(photo);
        } else {
          existingPhotos.push(photo);
        }
      }

      // Загружаем новые файлы
      const uploadedPhotos = [];
      for (const photo of newPhotosToUpload) {
        const url = await UploadFile(photo.file, authToken, `${API_BASE_URL}/api/admin/upload/just-view`);
        uploadedPhotos.push({
          url,
          caption: photo.caption,
        });
      }

      // Формируем финальный payload
      const payload = {
        name: formData.name,
        photos: [...existingPhotos, ...uploadedPhotos],
      };

      const method = id === 'new' ? 'POST' : 'PUT';
      const url =
        id === 'new'
          ? `${API_BASE_URL}/api/admin/projects/just-view`
          : `${API_BASE_URL}/api/admin/projects/just-view/${id}`;

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      // Освобождаем blob URL
      newPhotosToUpload.forEach(p => URL.revokeObjectURL(p.previewUrl));

      onSave();
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения проекта');
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

          <div className={styles.photosGrid}>
            {formData.photos.map((photo) => (
              <div key={photo.id} className={styles.photoItem}>
                {/* Используем previewUrl для новых, url для существующих */}
                <img src={photo.previewUrl || photo.url} alt={photo.caption} />
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

      {previewOpen && (
        <FlatPreview
          photos={formData.photos.map(p => ({
            ...p,
            url: p.previewUrl || p.url // для превью тоже нужен правильный URL
          }))}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}