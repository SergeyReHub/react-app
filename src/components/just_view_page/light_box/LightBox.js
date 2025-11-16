import React, { useEffect, useState, useCallback } from "react";
import "./light_box.css";
import IosShareIcon from '@mui/icons-material/IosShare';



export default function LightBox({ set_lightbox, lightbox, projects }) {

    const closeLightbox = () => set_lightbox({ open: false, projectIndex: 0, photoIndex: 0 });

    const showNext = () => {
        let { projectIndex, photoIndex } = lightbox;
        const currentProject = projects[projectIndex];
        if (!currentProject || currentProject.photos.length === 0) return;

        const nextPhotoIndex = photoIndex + 1;
        if (nextPhotoIndex < currentProject.photos.length) {
            // Есть следующее фото в этом же проекте
            set_lightbox((s) => ({ ...s, photoIndex: nextPhotoIndex }));
        } else {
            // Перейти к первому фото следующего проекта
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
            // Есть предыдущее фото в этом же проекте
            set_lightbox((s) => ({ ...s, photoIndex: prevPhotoIndex }));
        } else {
            // Перейти к последнему фото предыдущего проекта
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

    function onShare() {
        let { projectIndex, photoIndex } = lightbox;
        const currentProject = projects[projectIndex];
        const title = currentProject?.title || '360° тур';
        const text = currentProject?.description || 'Посмотрите этот интерактивный 360° тур.';
        const url = window.location.href + '/' + currentProject.id; // или project.shareUrl, если у вас есть отдельная ссылка

        if (navigator.share) {
            navigator.share({
                title,
                text,
                url,
            })
                .then(() => console.log('Контент успешно отправлен'))
                .catch((error) => {
                    if (error.name !== 'AbortError') {
                        console.warn('Ошибка при шеринге:', error);
                    }
                });
        } else {
            // fallback: копирование ссылки в буфер + уведомление
            navigator.clipboard
                .writeText(url)
                .then(() => {
                    alert('Ссылка скопирована в буфер обмена!');
                })
                .catch((err) => {
                    console.error('Не удалось скопировать ссылку:', err);
                    alert('Не удалось скопировать ссылку. Попробуйте вручную.');
                });
        }
    }

    return (
        <div className="just-view-page">
            {lightbox.open && projects[lightbox.projectIndex] && (
                <div className="just-view-page__lightbox-overlay" onClick={closeLightbox}>
                    <div className="just-view-page__lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <IosShareIcon
                            onClick={onShare}
                            sx={{
                                position: 'absolute',
                                top: '10px',
                                left: '16px',
                                fontSize: 60,
                                cursor: 'pointer',
                                color: 'rgba(211, 211, 211, 1)',
                                backgroundColor: 'rgba(92, 92, 92, 0.12)',
                                borderRadius: '10%',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                                zIndex: 1001,
                            }}
                        />
                        <button
                            className="just-view-page__lightbox-close"
                            onClick={closeLightbox}
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <img
                            src={projects[lightbox.projectIndex].photos[lightbox.photoIndex].url}
                            alt={projects[lightbox.projectIndex].photos[lightbox.photoIndex].caption || ""}
                            className="just-view-page__lightbox-img"
                        />

                        {projects[lightbox.projectIndex].photos.length > 1 && (
                            <>
                                <button
                                    className="just-view-page__nav-btn just-view-page__nav-prev"
                                    onClick={showPrev}
                                    aria-label="Previous"
                                >
                                    ‹
                                </button>
                                <button
                                    className="just-view-page__nav-btn just-view-page__nav-next"
                                    onClick={showNext}
                                    aria-label="Next"
                                >
                                    ›
                                </button>
                            </>
                        )}

                        <div className="just-view-page__lightbox-info">
                            <div className="just-view-page__lightbox-title">{projects[lightbox.projectIndex].name}</div>
                            <div className="just-view-page__lightbox-counter">
                                {lightbox.photoIndex + 1} / {projects[lightbox.projectIndex].photos.length}
                            </div>
                            {projects[lightbox.projectIndex].photos[lightbox.photoIndex].caption && (
                                <div className="just-view-page__lightbox-caption">
                                    {projects[lightbox.projectIndex].photos[lightbox.photoIndex].caption}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}