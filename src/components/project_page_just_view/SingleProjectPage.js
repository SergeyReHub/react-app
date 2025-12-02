// src/components/single_project_page/SingleProjectPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from 'react-router-dom';

import styles from './single_project_page.module.css';
import SingleProjectLightBox from './light_box/SingleProjectLightBox';
import ProjectSection from './SingleProjectSection';

// ✅ Исправлены пути к изображениям — ведущий слэш!
const FALLBACK_PROJECT = {
  id: "demo",
  name: "Пример проекта",
  description: "Демонстрационный проект артбетонных работ: заливка пола, столешница и декоративная стена в стиле лофт. Материал — полимерцементный композит с пигментацией и ручной полировкой.",
  photos: [
    { id: "ph1", url: "/images/panoramnie-kartinki-4.jpg", caption: "Демонстрационное фото 1" },
    { id: "ph2", url: "/images/example.jpeg", caption: "Демонстрационное фото 2" },
  ],
};

export default function SingleProjectPage({ apiUrl = "/api/projects" }) {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, photoIndex: 0 });

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setError('Project ID is missing');
      setProject(FALLBACK_PROJECT);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      const res = await fetch(`${apiUrl}/${projectId}`, { signal: controller.signal });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        throw new Error('Response is not JSON (possibly SmartCaptcha)');
      }

      const data = await res.json();

      const normalized = {
        id: data.id ?? projectId,
        name: data.name ?? 'Untitled Project',
        description: data.description ?? '',
        photos: Array.isArray(data.photos)
          ? data.photos.map((ph) => ({
            id: ph.id ?? ph.url,
            url: ph.url.startsWith('/') ? ph.url : `/${ph.url}`, // ✅ гарантируем абсолютный путь
            caption: ph.caption ?? '',
          }))
          : [],
      };

      setProject(normalized);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Using fallback project due to error:', err.message);
        setError(err.message || 'Failed to load project');
        setProject(FALLBACK_PROJECT);
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [apiUrl, projectId]);

  useEffect(() => {
    const cleanup = fetchData();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [fetchData]);

  // ✅ Возврат на главную, как в JustViewPage
  const handleClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <span className={styles.brand} onClick={handleClick}>
            <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
            <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
            <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
          </span>
          <h2 className={styles.title}>Загрузка...</h2>
        </div>
        <div className={styles.loader}>Подождите, идёт загрузка проекта…</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <span className={styles.brand} onClick={handleClick}>
            <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
            <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
            <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
          </span>
          <h2 className={styles.title}>Ошибка</h2>
        </div>
        <div className={styles.error}>Проект не найден или произошла ошибка загрузки.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {/* ✅ Заменено на бренд-блок */}
        <span
          className={styles.brand}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
          <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
          <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
          <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
        </span>

        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{project.name}</h1>
          {project.description && (
            <p className={styles.description}>{project.description}</p>
          )}
        </div>
      </div>

      <ProjectSection
        project={project}
        setLightbox={(photoIndex) => setLightbox({ open: true, photoIndex })}
      />

      {lightbox.open && project.photos[lightbox.photoIndex] && (
        <SingleProjectLightBox
          isOpen={lightbox.open}
          photos={project.photos}
          photoIndex={lightbox.photoIndex}
          projectName={project.name}
          projectId={project.id}
          onClose={() => setLightbox({ open: false, photoIndex: 0 })}
          onPhotoIndexChange={(idx) => setLightbox({ open: true, photoIndex: idx })}
        />
      )}

      {error && <div className={styles.error}>⚠️ {error}</div>}
    </div>
  );
}