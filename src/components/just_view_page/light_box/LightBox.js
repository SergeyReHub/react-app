// src/components/just_view_page/light_box/LightBox.js
import React from "react";
import IosShareIcon from '@mui/icons-material/IosShare';
import styles from './light_box.module.css';

export default function LightBox({ set_lightbox, lightbox, projects }) {
    const closeLightbox = () => set_lightbox({ open: false, projectIndex: 0, photoIndex: 0 });

    const showNext = () => {
        let { projectIndex, photoIndex } = lightbox;
        const currentProject = projects[projectIndex];
        if (!currentProject || currentProject.photos.length === 0) return;

        const nextPhotoIndex = photoIndex + 1;
        if (nextPhotoIndex < currentProject.photos.length) {
            set_lightbox((s) => ({ ...s, photoIndex: nextPhotoIndex }));
        } else {
            const nextProjectIndex = (projectIndex + 1) % projects.length;
            set_lightbox({
                open: true,
                projectIndex: nextProjectIndex,
                photoIndex: 0,
            });
        }
    };

    const showPrev = () => {
        let { projectIndex, photoIndex } = lightbox;
        const currentProject = projects[projectIndex];
        if (!currentProject || currentProject.photos.length === 0) return;

        const prevPhotoIndex = photoIndex - 1;
        if (prevPhotoIndex >= 0) {
            set_lightbox((s) => ({ ...s, photoIndex: prevPhotoIndex }));
        } else {
            const prevProjectIndex = (projectIndex - 1 + projects.length) % projects.length;
            const prevProject = projects[prevProjectIndex];
            const lastPhotoIndex = prevProject.photos.length - 1;
            set_lightbox({
                open: true,
                projectIndex: prevProjectIndex,
                photoIndex: Math.max(0, lastPhotoIndex),
            });
        }
    };

    const onShare = () => {
        const { projectIndex, photoIndex } = lightbox;
        const currentProject = projects[projectIndex];
        if (!currentProject) return;

        // ✅ Корректная ссылка: например, /project/abc123
        const projectUrl = `${window.location.origin}/just_view/${encodeURIComponent(currentProject.id)}`;

        // Опционально: можно добавить #photo-5 для якоря, если нужно
        // const fullUrl = `${projectUrl}#photo-${photoIndex}`;

        const title = currentProject.name || 'M.GROUP — Артбетон';
        const text = 'Посмотрите этот проект от M.GROUP';

        if (navigator.share) {
            navigator.share({ title, text, url: projectUrl })
                .catch(err => {
                    if (err.name !== 'AbortError') console.warn('Share failed:', err);
                });
        } else {
            navigator.clipboard.writeText(projectUrl)
                .then(() => alert('Ссылка на проект скопирована!'))
                .catch(() => alert('Не удалось скопировать ссылку.'));
        }
    };

    if (!lightbox.open || !projects[lightbox.projectIndex]) return null;

    const currentProject = projects[lightbox.projectIndex];
    const currentPhoto = currentProject.photos[lightbox.photoIndex];

    return (
        <div className={styles.overlay} onClick={closeLightbox}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                {/* Share icon — MUI, но позиционируем через CSS */}
                <IosShareIcon
                    onClick={onShare}
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
                />

                <button className={styles.closeBtn} onClick={closeLightbox} aria-label="Закрыть">
                    ✕
                </button>

                <img
                    src={currentPhoto.url}
                    alt={currentPhoto.caption || currentProject.name}
                    className={styles.img}
                />

                {currentProject.photos.length > 1 && (
                    <>
                        <button
                            className={`${styles.navBtn} ${styles.navPrev}`}
                            onClick={showPrev}
                            aria-label="Предыдущее фото"
                        >
                            ‹
                        </button>
                        <button
                            className={`${styles.navBtn} ${styles.navNext}`}
                            onClick={showNext}
                            aria-label="Следующее фото"
                        >
                            ›
                        </button>
                    </>
                )}

                <div className={styles.info}>
                    <div className={styles.title}>{currentProject.name}</div>
                    <div className={styles.counter}>
                        {lightbox.photoIndex + 1} / {currentProject.photos.length}
                    </div>
                    {currentPhoto.caption && (
                        <div className={styles.caption}>{currentPhoto.caption}</div>
                    )}
                </div>
            </div>
        </div>
    );
}