// MiniTourPreview.jsx — для PSV v5.14, без ошибок
import React, { useEffect, useRef } from 'react';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/gallery-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import styles from './MiniTourPreview.module.css';

export default function MiniTourPreview({ nodes = [], startNodeId }) {

  const viewerRef = useRef(null);

  useEffect(() => {

    if (nodes.length === 0 || !startNodeId) return;

    const startNode = nodes.find(n => String(n.id) === String(startNodeId));
    if (!startNode) return;

    try {
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
            arrowStyle: {
              color: 0xd5d5d5,
              hoverColor: 0xaa5500,
              outlineColor: 0x000000,
              scale: [0.5, 2]
            },
            nodes: nodes,

          }),
        ],
      });


      viewer.addEventListener('ready', () => {
        const tourPlugin = viewer.getPlugin(VirtualTourPlugin);
        if (tourPlugin) {
          tourPlugin.setCurrentNode(String(startNodeId)); // ← именно ID!
        }
      });


      return () => {
        return () => {
          try {
            viewer.destroy(); // ← уничтожаем
          } catch (e) {
            // Игнорируем ошибки при уничтожении (например, если уже уничтожен)
          }
          if (viewerRef.current) {
            viewerRef.current.innerHTML = ''; // ← гарантируем чистый DOM
          }
        };

      };
    } catch (err) {
      console.error('❌ Ошибка инициализации:', err.message);
    }
  }, [nodes, startNodeId]);

  return (
    <div className={styles.container}>
      <div id='viewer' ref={viewerRef} className={styles.viewer} />
    </div>
  );
}