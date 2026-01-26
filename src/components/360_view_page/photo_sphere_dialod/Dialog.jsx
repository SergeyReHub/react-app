// Dialog.jsx — ✅ Полная поддержка VirtualTour, работает в build
import React, { useEffect, useRef, useCallback } from 'react';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/gallery-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import CancelIcon from '@mui/icons-material/Cancel';
import IosShareIcon from '@mui/icons-material/IosShare';
import styles from './Dialog.module.css';
import '../../../styles/psv-overrides.css';

const Dialog = ({ project, onClose }) => {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);
  const initAttempt = useRef(0);
  const MAX_ATTEMPTS = 5;

  // Инициализация — с защитой и повторными попытками
  const initViewer = useCallback(() => {
    if (!project?.nodes?.length) {
      console.error('[Dialog] Invalid project');
      return;
    }

    if (!viewerRef.current) {
      if (initAttempt.current < MAX_ATTEMPTS) {
        initAttempt.current++;
        // Повтор через короткую задержку
        setTimeout(initViewer, 100);
      } else {
        console.error('[Dialog] viewerRef never resolved');
      }
      return;
    }

    try {
      // ✅ Создаём viewer
      const viewer = new Viewer({
        container: viewerRef.current,
        loadingImg: '/assets/loader.gif',
        touchmoveTwoFingers: true,
        mousewheelCtrlKey: true,
        defaultZoomLvl: 0,
        defaultYaw: '130deg',
        navbar: 'zoom move gallery caption fullscreen',
        plugins: [
          [MarkersPlugin],
          [GalleryPlugin, { thumbnailSize: { width: 100, height: 100 } }],
          [VirtualTourPlugin, {
            positionMode: 'gps', 
            renderMode: '3d',       
            nodes: project.nodes.map(node => ({
              ...node,
              id: String(node.id), // ✅ всегда строка
            })),
            startNodeId: String(project.startNodeId || project.nodes[0]?.id),
          }],
        ],
      });

      viewerInstance.current = viewer;

      // ✅ Дожидаемся готовности перед стартом тура
      viewer.addEventListener('ready', () => {
        const tour = viewer.plugins.virtualTour;
        if (tour && tour.setCurrentNode) {
          const startId = String(project.startNodeId || project.nodes[0]?.id);
          tour.setCurrentNode(startId).catch(err => {
            console.error('[Dialog] Failed to set start node:', err);
          });
        }
      });

    } catch (err) {
      console.error('[Dialog] Viewer init failed:', err);
    }
  }, [project]);

  // Запускаем инициализацию
  useEffect(() => {
    initAttempt.current = 0;
    initViewer();

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
        viewerInstance.current = null;
      }
    };
  }, [initViewer]);

  // Share
  const onShare = () => {
    const title = project?.title || '360° тур';
    const text = project?.description || 'Посмотрите этот интерактивный 360° тур.';
    const url = `${window.location.origin}${window.location.pathname}${project?.id || ''}`;

    if (navigator.share) {
      navigator.share({ title, text, url })
        .catch(err => err.name !== 'AbortError' && console.warn('Share failed:', err));
    } else {
      navigator.clipboard.writeText(url)
        .then(() => alert('Ссылка скопирована!'))
        .catch(() => alert('Не удалось скопировать ссылку.'));
    }
  };

  return (
    <div className={styles.dialogOverlay}>
      <div onClick={e => e.stopPropagation()} className={styles.psvContainer}>
        <CancelIcon onClick={onClose} sx={{
          position: 'absolute', top: '10px', right: '16px', fontSize: 60,
          cursor: 'pointer', color: 'rgba(0,0,0,1)', bgcolor: 'rgba(146,146,146,1)',
          borderRadius: '50%', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' }, zIndex: 1001
        }} />
        <IosShareIcon onClick={onShare} sx={{
          position: 'absolute', top: '10px', left: '16px', fontSize: 60,
          cursor: 'pointer', color: 'rgba(48,48,48,1)', bgcolor: 'rgba(0,0,0,0.16)',
          borderRadius: '10%', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' }, zIndex: 1001
        }} />
        <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default Dialog;