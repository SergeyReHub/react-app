// src/components/admin/projects-flat/FlatPreview.js
import React, { useState } from 'react';
import styles from './FlatPreview.module.css';

export default function FlatPreview({ photos, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.imageWrapper}>
          <img src={currentPhoto.url} alt={currentPhoto.caption} />
        </div>

        <div className={styles.caption}>
          {currentPhoto.caption} ({currentIndex + 1} / {photos.length})
        </div>

        {photos.length > 1 && (
          <div className={styles.controls}>
            <button className={styles.navBtn} onClick={prev}>
              ‹
            </button>
            <button className={styles.navBtn} onClick={next}>
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}