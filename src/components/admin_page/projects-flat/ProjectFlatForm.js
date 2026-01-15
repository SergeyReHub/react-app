// src/components/admin/projects-flat/ProjectFlatForm.js
import React, { useState, useRef } from 'react';
import styles from './ProjectFlatForm.module.css';

const EMPTY_PROJECT = { id: '', name: '', photos: [] };

export default function ProjectFlatForm({ id, initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || EMPTY_PROJECT);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    const newPhotos = await Promise.all(
      imageFiles.map(async (file) => {
        // Simulate upload (in real: POST /api/upload → get URL)
        const url = `/uploads/${encodeURIComponent(file.name)}`;
        return {
          id: Date.now() + Math.random().toString(36).slice(2),
          url,
          caption: file.name,
        };
      })
    );

    setFormData({
      ...formData,
      photos: [...formData.photos, ...newPhotos],
    });
  };

  const removePhoto = (photoId) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter(p => p.id !== photoId),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? 'http://localhost:8080/api/admin/projects-flat' : `http://localhost:8080/api/admin/projects-flat/${id}`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      onSave();
    } catch (err) {
      alert('Ошибка сохранения');
    }
  };

  
  return (
    <div className={styles.formCard}>
      <h2>{id === 'new' ? 'Новый фото-проект' : 'Редактировать проект'}</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>ID</label>
          <input
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            required
            disabled={id !== 'new'}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Название</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.photosSection}>
          <h3>Фотографии ({formData.photos.length})</h3>

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
                    setFormData({
                      ...formData,
                      photos: formData.photos.map(p =>
                        p.id === photo.id ? { ...p, caption: e.target.value } : p
                      ),
                    })
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

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn}>
            {id === 'new' ? 'Создать' : 'Сохранить'}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}