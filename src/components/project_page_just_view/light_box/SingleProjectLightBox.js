// src/components/single_project_page/light_box/SingleProjectLightBox.js
import React from "react";
import IosShareIcon from '@mui/icons-material/IosShare';
import styles from './single_project_light_box.module.css';

export default function SingleProjectLightBox({
  isOpen,
  photos = [],
  photoIndex,
  projectName = '',
  projectId = '',
  onClose,
  onPhotoIndexChange,
}) {
  if (!isOpen || photos.length === 0 || photoIndex < 0 || photoIndex >= photos.length) {
    return null;
  }

  const currentPhoto = photos[photoIndex];

  const showNext = () => {
    if (photoIndex < photos.length - 1) {
      onPhotoIndexChange(photoIndex + 1);
    }
    // ❌ НЕТ циклического перехода — просто не даём уйти дальше последнего фото
  };

  const showPrev = () => {
    if (photoIndex > 0) {
      onPhotoIndexChange(photoIndex - 1);
    }
    // ❌ НЕТ перехода к предыдущему проекту
  };

  const onShare = () => {
    // ✅ Улучшенная ссылка: добавляем якорь #photo-N
    const baseUrl = `${window.location.origin}/just_view/${encodeURIComponent(projectId)}`;

    const title = projectName || 'M.GROUP — Артбетон';
    const text = currentPhoto.caption
      ? `«${currentPhoto.caption}» — проект от M.GROUP`
      : `Проект «${projectName}» от M.GROUP`;

    if (navigator.share) {
      navigator.share({ title, text, url: baseUrl })
        .catch(err => {
          if (err.name !== 'AbortError') console.warn('Share failed:', err);
        });
    } else {
      navigator.clipboard.writeText(baseUrl)
        .then(() => alert('Ссылка на фото скопирована!'))
        .catch(() => alert('Не удалось скопировать ссылку.'));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowRight') showNext();
    else if (e.key === 'ArrowLeft') showPrev();
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Просмотр фото ${photoIndex + 1} из ${photos.length}`}
    >
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Share */}
        <IosShareIcon
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          sx={{
            position: 'absolute',
            top: '20px',
            left: '24px',
            fontSize: 40,
            cursor: 'pointer',
            color: '#ddd',
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
            borderRadius: '50%',
            padding: '8px',
            transition: 'all 0.25s ease',
            '&:hover': {
              color: '#ffd700',
              backgroundColor: 'rgba(177, 91, 255, 0.4)',
              transform: 'scale(1.15)',
            },
            zIndex: 1003,
          }}
          aria-label="Поделиться фото"
        />

        {/* Close */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Закрыть просмотр"
        >
          ✕
        </button>

        {/* Image */}
        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption || `${projectName} — фото ${photoIndex + 1}`}
          className={styles.img}
          loading="eager"
        />

        {/* Navigation */}
        {photos.length > 1 && (
          <>
            <button
              className={`${styles.navBtn} ${styles.navPrev} ${photoIndex === 0 ? styles.disabled : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              disabled={photoIndex === 0}
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
            <button
              className={`${styles.navBtn} ${styles.navNext} ${photoIndex === photos.length - 1 ? styles.disabled : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              disabled={photoIndex === photos.length - 1}
              aria-label="Следующее фото"
            >
              ›
            </button>
          </>
        )}

        {/* Info panel */}
        <div className={styles.info}>
          <div className={styles.title}>{projectName}</div>
          <div className={styles.counter}>
            {photoIndex + 1} / {photos.length}
          </div>
          {currentPhoto.caption && (
            <div className={styles.caption}>{currentPhoto.caption}</div>
          )}
        </div>
      </div>
    </div>
  );
}