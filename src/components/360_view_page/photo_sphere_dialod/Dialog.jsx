// Dialog.jsx
import React, { useState, useEffect } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import './dialog.css';

const Dialog = ({ project, onClose }) => {
  // Проверка данных
  if (!project.nodes || project.nodes.length === 0) {
    console.error('Project has no nodes');
    return null;
  }

  

  // Создаём узлы в формате VirtualTourPlugin
  const nodes = project.nodes.map(node => ({
    id: node.id,
    panorama: node.panorama,
    thumbnail: node.thumbnail || node.panorama, // fallback
    name: node.name || node.id,
    caption: node.caption || '',
    links: (node.links || []).map(link => ({
      nodeId: link.nodeId,
      position: link.position,
      // можно добавить yaw/pitch для точного позиционирования:
      // yaw: link.yaw,
      // pitch: link.pitch,
    })),
    // sphereCorrection — для начального поворота (если нужно)
    ...(node.sphereCorrection && { sphereCorrection: node.sphereCorrection }),
  }));
  
  console.log('Nodes for VirtualTourPlugin:', nodes);
  // Убедитесь, что каждый link имеет position или все узлы — gps
  nodes.forEach(node => {
    node.links?.forEach(link => {
      if (!link.position && !node.gps) {
        console.warn(`⚠️ Link ${link.nodeId} in node ${node.id} has no position!`);
      }
    });
  });

  return (
    <div
      className="dialog-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95vw',
          height: '95vh',
          maxWidth: '1400px',
          position: 'relative',
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1001,
          }}
        >
          &times;
        </button>

        <div style={{ width: '100%', height: '100%' }}>
          <ReactPhotoSphereViewer
            // Начинаем с первого узла или указанного
            src={nodes.find(n => n.id === project.startNodeId)?.panorama || nodes[0].panorama}
            width="100%"
            height="100%"
            // Автоматически подгружает следующие панорамы
            loadingImg="/assets/loader.gif"
            // Плагины
            plugins={[
              MarkersPlugin,
              [GalleryPlugin, { thumbnailSize: { width: 100, height: 100 } }],
              [
                VirtualTourPlugin,
                {
                  nodes,
                  startNodeId: project.startNodeId || nodes[0].id,
                  // Опционально: 3D-режим (требует GPS-координат)
                  // positionMode: 'gps',
                  // renderMode: '3d',
                },
              ],
            ]}
            // Опционально: navbar
            navbar={['zoom', 'move', 'gallery', 'caption', 'fullscreen']}
            // transition между узлами
            transition={{ duration: 1500, loader: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dialog;