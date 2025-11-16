// Dialog.jsx
import React, { useEffect, useRef } from 'react';
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
import './dialog.css';

// const markerLighthouse = {
//   id: 'marker-1',
//   image: '/assets/pin-red.png',
//   tooltip: 'SKALA',
//   size: { width: 32, height: 32 },
//   anchor: 'bottom center',
//   gps: [-80.155973, 25.666601, 29 + 3],
// };

const Dialog = ({ project, onClose }) => {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);

  useEffect(() => {
    // 🔴 Проверка данных перед инициализацией
    if (!project?.nodes || project.nodes.length === 0) {
      console.error('Project has no nodes or is invalid');
      return (
        <div
          className="dialog-overlay"
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#333',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            <p>Ошибка: проект не содержит панорам.</p>

          </div>
        </div>
      );
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
          startNodeId: project.startNodeId || project.nodes[0]?.id, // безопасное значение
        }),
      ],
    });


    // Cleanup on unmount
    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
        viewerInstance.current = null;
      }
    };
  }, [project]); // ✅ Добавьте зависимость от `project`, иначе эффект не обновится при смене проекта

  function onShare() {
    const title = project?.title || '360° тур';
    const text = project?.description || 'Посмотрите этот интерактивный 360° тур.';
    const url = window.location.href + '/' + project.id; // или project.shareUrl, если у вас есть отдельная ссылка

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
    <div
      className="dialog-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='psv-container'
      >
        <CancelIcon
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: '10px',
            right: '16px',
            fontSize: 60,
            cursor: 'pointer',
            color: 'rgba(0, 0, 0, 1)',
            backgroundColor: 'rgba(146, 146, 146, 1)',
            borderRadius: '50%',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
            zIndex: 1001,
          }}
        />
        <IosShareIcon
          onClick={onShare}
          sx={{
            position: 'absolute',
            top: '10px',
            left: '16px',
            fontSize: 60,
            cursor: 'pointer',
            color: 'rgba(48, 48, 48, 1)',
            backgroundColor: 'rgba(0, 0, 0, 0.16)',
            borderRadius: '10%',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
            zIndex: 1001,
          }}
        />
        <div id="viewer" ref={viewerRef} style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
};

export default Dialog;