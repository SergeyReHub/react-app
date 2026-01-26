// src/components/project_page_360/ProjectPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/config';

// CSS Modules
import styles from './project_page.module.css';

// Photo Sphere Viewer CSS (глобальные — оставляем как есть)
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/gallery-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';

// Photo Sphere Viewer JS
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const FALLBACK_PROJECTS = {
  title: "Office Tour",
  description: "asdfgdsafghejkfnvsnadkjfsknjekv dnljssssssssssssssssssssssssfvvvvvvvvvv vvvvvvvvvvnjnjjjjjjjjjjjjjjjjjnjjjjjjjjjjjjjjjjjjjjjjjjvffffffffffffffffffffffnjjjjjjjjjjjjjjjjjjjjjjjjjjjfvnjfvjfvjnfvjvjfvjfvjnfvfvvfnjfvjnjnfvfvnjffvjsnjlvfnvsljnvsvnsfjlvnsj fvnsfjlvnsfjlvnsvjsnfvsjflvnsfjvnsfvjnsvjsfn vsjvnsfjvnsvljsnfvjlsnvjsflvnsljvnsfjlvsnvjlsfnjasdfhj",
  nodes: [
    {
      id: 1,
      panorama: "/images/panoramnie-kartinki-4.jpg",
      thumbnail: "/images/panoramnie-kartinki-4.jpg",
      name: "Lobby",
      caption: "[1] Main entrance",
      links: [{ nodeId: 2 }],
      gps: [55.7815, 37.6759, 1],
      sphereCorrection: { pan: "33deg" }
    },
    {
      id: 2,
      panorama: "/images/panoramnie-kartinki-4.jpg",
      thumbnail: "/images/panoramnie-kartinki-4.jpg",
      name: "Hallway",
      caption: "[2] Corridor to offices",
      links: [{ nodeId: 1 }, { nodeId: 3 }],
      gps: [55.7816, 37.6760, 1],
      sphereCorrection: { pan: "66deg" }
    },
    {
      id: 3,
      panorama: "/images/panoramnie-kartinki-4.jpg",
      thumbnail: "/images/panoramnie-kartinki-4.jpg",
      name: "Office",
      caption: "[3] Open workspace",
      links: [{ nodeId: 2 }],
      gps: [55.7817, 37.6761, 1],
      sphereCorrection: { pan: "99deg" }
    }
  ]
};

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  // ✅ Init viewer AFTER project is available
  useEffect(() => {
    if (!project?.nodes || !viewerRef.current) return;

    if (viewerInstance.current) {
      viewerInstance.current.destroy();
    }

    const viewer = new Viewer({
      container: viewerRef.current,
      loadingImg: '/assets/loader.gif',
      touchmoveTwoFingers: true,
      mousewheelCtrlKey: true,
      defaultYaw: '130deg',
      navbar: 'zoom move gallery caption fullscreen',
      plugins: [
        MarkersPlugin,
        GalleryPlugin.withConfig({
          thumbnailSize: { width: 100, height: 100 },
        }),
        VirtualTourPlugin.withConfig({
          positionMode: 'gps',
          renderMode: '3d',
          nodes: project.nodes,
          startNodeId: project.nodes[0]?.id || 1,
        }),
      ],
    });

    viewerInstance.current = viewer;

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
        viewerInstance.current = null;
      }
    };
  }, [project]);

  // ✅ Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/projects/360-view/${id}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProject(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Fetch failed:", err);
        setError(err.message);
        setProject(FALLBACK_PROJECTS);
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ UI
  if (loading) {
    return (
      <div className={styles.loader}>
        Loading 360° tour…
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        ❌ Error: {error}. Using demo data.
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.loader}>
        No project data.
      </div>
    );
  }

  return (
    <div className={styles.projectPage}>
      <div className={styles.globalHeader}>
        <span className={styles.brand} onClick={handleClick}>
          <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
          <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
          <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
        </span>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>{project.title || "Untitled Project"}</h1>
      </div>
      <div className={styles.descriptionContainer}>
        {project.description && (
          <>
            {project.description
              .split(/\n\s*\n/) // разделяет по одной или нескольким пустым строкам
              .filter(paragraph => paragraph.trim() !== '') // убирает пустые
              .map((paragraph, index) => (
                <p key={index} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
          </>
        )}
      </div>
      <div className={styles.viewerSection}>
          <div className={styles.viewerContainer} ref={viewerRef} />
      </div>
    </div>

  );
}