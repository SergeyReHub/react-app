// src/components/just_view_page/JustViewPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

// ✅ CSS Modules
import styles from './just_view_page.module.css';

// ✅ Child components (должны тоже использовать свои модули)
import ProjectSection from "./projects_section/ProjectSection";
import LightBox from "./light_box/LightBox";

// Fallback data
const FALLBACK_PROJECTS = [
  {
    id: "demo-1",
    name: "Sample Project",
    photos: [
      {
        id: "ph1",
        url: "images/panoramnie-kartinki-4.jpg",
        caption: "This is a demo image. Data failed to load.",
      },
      {
        id: "ph2",
        url: "images/example.jpeg",
        caption: "Check your network or API endpoint.",
      },
    ],
  },
  {
    id: "demo-2",
    name: "Another Project",
    photos: [
      {
        id: "ph3",
        url: "images/panoramnie-kartinki-4.jpg",
        caption: "Fallback image 3.",
      },
      {
        id: "ph4",
        url: "images/example.jpeg",
        caption: "Fallback image 4.",
      },
    ],
  },
];

export default function JustViewPage({ apiUrl = "http://localhost:8080/api/projects/just-view?page=0&size=10" }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, projectIndex: 0, photoIndex: 0 });

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(apiUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      // 🛡 Защита от SmartCaptcha (HTML вместо JSON)
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        throw new Error('Response is not JSON (possibly SmartCaptcha)');
      }

      const data = await res.json();

      let normalized = [];
      if (Array.isArray(data) && data.length > 0) {
        if (data[0].photos) {
          // grouped by project
          normalized = data.map((p) => ({
            id: p.id ?? p.name,
            name: p.name ?? 'Untitled',
            photos: Array.isArray(p.photos)
              ? p.photos.map((ph) => ({
                  id: ph.id ?? ph.url,
                  url: ph.url,
                  caption: ph.caption ?? '',
                }))
              : [],
          }));
        } else {
          // flat array → group by projectId
          const map = new Map();
          data.forEach((ph) => {
            const pid = ph.projectId ?? ph.id ?? 'unknown';
            const pname = ph.projectName ?? `Project ${pid}`;
            if (!map.has(pid)) {
              map.set(pid, { id: pid, name: pname, photos: [] });
            }
            map.get(pid).photos.push({
              id: ph.id ?? ph.url,
              url: ph.url,
              caption: ph.caption ?? '',
            });
          });
          normalized = Array.from(map.values());
        }
      }

      setProjects(normalized);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn('Using fallback data:', err.message);
        setError(err.message || "Failed to fetch");
        setProjects(FALLBACK_PROJECTS);
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [apiUrl]);

  useEffect(() => {
    const cleanup = fetchData();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [fetchData]);

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.brand} onClick={handleClick}>
          <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
          <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
          <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
        </span>
        <h2 className={styles.title}>Проекты с фото-списком</h2>
      </div>

      {loading && <div className={styles.loader}>Loading photos…</div>}
      {!loading && !error && projects.length === 0 && (
        <div className={styles.loader}>No photos found</div>
      )}

      <ProjectSection projects={projects} set_light_box={setLightbox} />

      {lightbox.open && projects[lightbox.projectIndex] && (
        <LightBox
          projects={projects}
          set_lightbox={setLightbox}
          lightbox={lightbox}
          // Передаём классы, если LightBox не на модулях (временно)
          classNameOverrides={{
            img: styles.lightboxImg,
            navBtn: styles.navBtn,
            navPrev: styles.navPrev,
            navNext: styles.navNext,
          }}
        />
      )}

      {error && <div className={styles.error}>⚠️ {error}</div>}
    </div>
  );
}