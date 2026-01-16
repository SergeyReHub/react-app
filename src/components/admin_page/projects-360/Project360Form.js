// src/components/admin/projects-360/Project360Form.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import '../../../styles/psv-overrides.css';
import styles from './Project360Form.module.css';
import MiniTourPreview from '../preview_sphere/MiniTourPreview';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/gallery-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useAuth } from '../../../context/AuthContext';
import { UploadFile } from '../../../utils/UploadFile';

const EMPTY_PROJECT = { id: Date.now().toString(), title: '', description: '', nodes: [] };
const MAP_SIZE = 400;
const MAP_CENTER = MAP_SIZE / 2;
const MAP_SCALE = 100000; // 0.01° ≈ 1.1 м → 800 пикселей

export default function Project360Form({ id, initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || EMPTY_PROJECT);
  const [newNode, setNewNode] = useState({ id: '', name: '', panorama: '', thumbnail: '', caption: '' });
  const [previewStartNodeId, setPreviewStartNodeId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const [dragState, setDragState] = useState(null); // { nodeId, startX, startY, startGps }
  const [tempNodePositions, setTempNodePositions] = useState({});

  const [unlinkConfirmation, setUnlinkConfirmation] = useState(null); // { from, to }

  const [closeButtonVisibility, setCloseButtonVisibility] = useState(false);

  const fileInputRef = useRef(null);
  const manualFileInputRef = useRef(null);

  const viewerRef = useRef(null);

  const viewerInstanceRef = useRef(null); // ← один источник правды

  const [editingAltitude, setEditingAltitude] = useState(null); // { nodeId, altitude }

  const { authToken } = useAuth();





  // === Загрузка ===
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) uploadFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFiles = (e) => {
    if (e.target.files?.length) uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const uploadFiles = async (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    const newNodes = [];
    for (const file of imageFiles) {
      try {
        const url = await UploadFile(file, authToken); // ← загружаем на сервер

        const nodeId = `node_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const lat = 55.7817 + (Math.random() - 0.99) * 0.001;
        const lon = 37.6761 + (Math.random() - 0.99) * 0.001;
        console.log(url);
        newNodes.push({
          id: nodeId,
          name: file.name.replace(/\.[^/.]+$/, ''),
          panorama: url,        // ← публичный путь
          thumbnail: url,       // ← тот же путь
          caption: file.name,
          gps: [lon, lat, 1],
          sphereCorrection: { pan: 0, roll: 0, tilt: 0 },
          links: [],
        });
      } catch (err) {
        console.error('Failed to upload file:', file.name, err);
        alert(`Не удалось загрузить файл: ${file.name}`);
      }
    }

    setFormData(prev => ({
      ...prev,
      nodes: [...prev.nodes, ...newNodes],
      startNodeId: prev.startNodeId || newNodes[0]?.id,
    }));
  };

  // === Связи ===
  const toggleNodeSelection = (id) => setSelectedNodeIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const createLinks = () => {
    if (selectedNodeIds.length < 2) return;
    setFormData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => selectedNodeIds.includes(node.id) ? {
        ...node,
        links: [
          ...node.links,
          ...selectedNodeIds
            .filter(id => id !== node.id)
            .filter(id => !node.links.some(l => l.nodeId === id))
            .map(id => ({ nodeId: id }))
        ]
      } : node)
    }));
    setSelectedNodeIds([]);
  };

  const removeNode = (nodeId) => {
    setFormData(prev => {
      const newNodes = prev.nodes
        .filter(n => n.id !== nodeId)
        .map(n => ({ ...n, links: n.links.filter(l => l.nodeId !== nodeId) }));

      // Если удалили последнюю ноду — закрываем превью
      if (newNodes.length === 0) {
        setPreviewStartNodeId(null);
        setCloseButtonVisibility(false);
        if (viewerInstanceRef.current) {
          try {
            viewerInstanceRef.current.destroy();
          } catch (e) { }
          viewerInstanceRef.current = null;
        }
      }

      // Если удалили текущую стартовую — переключаемся на первую или null
      const newStartId = prev.startNodeId === nodeId
        ? (newNodes[0]?.id || null)
        : prev.startNodeId;

      return {
        ...prev,
        nodes: newNodes,
        startNodeId: newStartId,
      };
    });

    // Если удалили текущую открытую в превью — закрываем или переключаем
    if (previewStartNodeId === nodeId) {
      const remainingNode = formData.nodes.find(n => n.id !== nodeId);
      setPreviewStartNodeId(remainingNode?.id || null);
    }
  };

  const unlinkNodes = (nodeIdA, nodeIdB) => {
    setFormData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => {
        if (node.id === nodeIdA) {
          return {
            ...node,
            links: node.links.filter(link => link.nodeId !== nodeIdB)
          };
        }
        if (node.id === nodeIdB) {
          return {
            ...node,
            links: node.links.filter(link => link.nodeId !== nodeIdA)
          };
        }
        return node;
      })
    }));
  };



  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNodeChange = e => setNewNode(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? 'http://localhost:8080/api/admin/projects/360-view' : `http://localhost:8080/api/admin/projects/360-view/${id}`;
      await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }, body: JSON.stringify(formData) });
      onSave();
    } catch { alert('Ошибка сохранения'); }
  };

  // После createLinks()
  const handleNodeClick = (e, nodeId) => {
    // ПКМ — сделать стартовой
    if (e.button === 2) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, startNodeId: nodeId }));
      return;
    }

    // ЛКМ — обычная селекция (как было)
    toggleNodeSelection(nodeId);
  };

  // АКТУАЛЬНЫЙ ID стартовой ноды
  const activeStartId = previewStartNodeId || formData.nodes[0]?.id || null;
  const startNode = formData.nodes.find(n => n.id === activeStartId);

  // Функция создания viewer
  const createViewer = useCallback(() => {
    if (!viewerRef.current || formData.nodes.length === 0) return;

    // Если уже есть — сначала убиваем
    if (viewerInstanceRef.current) {
      try { viewerInstanceRef.current.destroy(); } catch (e) { }
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
        GalleryPlugin.withConfig({ thumbnailSize: { width: 100, height: 100 } }),
        [VirtualTourPlugin, {
          positionMode: 'gps',
          renderMode: '3d',
          arrowStyle: { color: '#d5d5d5', hoverColor: '#ff6b00', outlineColor: '#000' },
          showLinkTooltip: true,  // ← Включаем tooltip

          nodes: formData.nodes.map(n => ({
            ...n,
            id: String(n.id),
            thumbnail: n.thumbnail || n.panorama,
            caption: n.name,
            links: n.links.map(l => ({ nodeId: String(l.nodeId) }))
          }))
        }]
      ]
    });

    viewerInstanceRef.current = viewer;

    viewer.addEventListener('ready', () => {
      const tour = viewer.getPlugin(VirtualTourPlugin);
      if (tour && activeStartId) {
        tour.setCurrentNode(String(activeStartId), { renderArrows: true });
      }
      setCloseButtonVisibility(true);
    });

  }, [formData.nodes, activeStartId]);

  // ЕДИНСТВЕННЫЙ useEffect — решает ВСЁ
  useEffect(() => {
    // Если превью закрыто — ничего не делаем
    if (previewStartNodeId === null) {
      if (viewerInstanceRef.current) {
        try { viewerInstanceRef.current.destroy(); } catch (e) { }
        viewerInstanceRef.current = null;
      }
      return;
    }

    // Если viewer ещё не создан — создаём
    if (!viewerInstanceRef.current) {
      createViewer();
      return;
    }

    // Если viewer уже есть — просто обновляем данные
    const tour = viewerInstanceRef.current.getPlugin(VirtualTourPlugin);
    if (!tour) return;

    // Обновляем ноды
    tour.setNodes(formData.nodes.map(n => ({
      ...n,
      id: String(n.id),
      links: n.links.map(l => ({ nodeId: String(l.nodeId) }))
    })));

    // Определяем, на какую ноду переключиться
    const currentId = tour.getCurrentNode()?.id;
    const targetId = currentId && formData.nodes.some(n => n.id === currentId)
      ? currentId
      : activeStartId;

    if (targetId) {
      tour.setCurrentNode(String(targetId), { renderArrows: true });
    }

  }, [previewStartNodeId, formData.nodes, activeStartId]);

  // GPS → SVG
  const gpsToPixel = ([lon, lat]) => {
    // Центр карты — не фиксированный, а динамический!
    const centerLon = 37.6761;
    const centerLat = 55.7817;
    return {
      x: MAP_CENTER + (lon - centerLon) * MAP_SCALE,
      y: MAP_CENTER - (lat - centerLat) * MAP_SCALE,
    };
  };
  const pixelToGps = ({ x, y }) => {
    const centerLon = 37.6761;
    const centerLat = 55.7817;
    return [
      centerLon + (x - MAP_CENTER) / MAP_SCALE,
      centerLat - (y - MAP_CENTER) / MAP_SCALE,
      1
    ];
  };

  // Генерируем "хэш изменений" — простой, но надёжный способ
  const nodesHash = formData.nodes
    .map(n => `${n.id}:${n.gps.join(',')}:${n.links.map(l => l.nodeId).join('|')}`)
    .join(';');

  const handleUnlinkConfirm = () => {
    if (unlinkConfirmation) {
      const { from, to } = unlinkConfirmation;
      unlinkNodes(from.id, to.id);
      setUnlinkConfirmation(null);
    }
  };

  const handleUnlinkCancel = () => {
    setUnlinkConfirmation(null);
  };

  // Начало перетаскивания — фиксируем ВСЁ
  const handleNodeDragStart = (e, node) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const svg = e.currentTarget.closest('svg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse());

    setDragState({
      nodeId: node.id,
      startX: x,
      startY: y,
      startGps: [...node.gps], // копируем
    });
  };

  // Движение — обновляем в real-time
  const handleSvgPointerMove = (e) => {
    if (!dragState) return;

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse());

    // Обновляем ТОЛЬКО визуальную позицию — без setFormData!
    setTempNodePositions(prev => ({
      ...prev,
      [dragState.nodeId]: { x, y }
    }));
  };

  // Завершение — сбрасываем состояние
  const handleSvgPointerUp = () => {
    if (dragState) {
      const { nodeId, startX, startY } = dragState;
      const finalPos = tempNodePositions[nodeId];

      if (finalPos) {
        // Переводим финальную позицию в GPS
        const newGps = pixelToGps(finalPos);

        // Обновляем данные ОДИН РАЗ
        setFormData(prev => ({
          ...prev,
          nodes: prev.nodes.map(n =>
            n.id === nodeId ? { ...n, gps: newGps } : n
          )
        }));
      }
    }

    // Сбрасываем всё
    setDragState(null);
    setTempNodePositions({});
  };

  const handleClosePreview = () => {
    if (viewerInstanceRef.current) {
      try {
        viewerInstanceRef.current.destroy();
      } catch (e) {
        console.warn('Viewer already destroyed');
      }
      viewerInstanceRef.current = null;
    }
    setPreviewStartNodeId(null);
    setCloseButtonVisibility(false);
  };

  return (
    <div className={styles.formCard}>
      <h2>{id === 'new' ? 'Новый 360° проект' : 'Редактировать проект'}</h2>

      <form onSubmit={handleSubmit}>
        {/* Основные поля */}
        <div className={styles.formGroup}>
          <label>Название</label>
          <input name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Описание</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
        </div>

        {/* Modal: подтверждение отвязки */}
        {unlinkConfirmation && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmModal}>
              <p>Отвязать &laquo;{unlinkConfirmation.from.name}&raquo; ↔ &laquo;{unlinkConfirmation.to.name}&raquo;?</p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleUnlinkCancel}>
                  Отмена
                </button>
                <button type="button" className={styles.saveBtn} onClick={handleUnlinkConfirm}>
                  Отвязать
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div className={styles.section}>
          <h3>Загрузить панорамы</h3>
          <div
            className={`${styles.dropZone} ${dragActive ? styles.active : ''}`}
            onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
            <div className={styles.dropIcon}>Drop</div>
            <p>Перетащите изображения или кликните</p>
          </div>
        </div>

        {/* Мини-карта */}
        <div className={styles.section}>
          <div className={styles.mapHeader}>
            <h3>Мини-карта ({formData.nodes.length})</h3>
            {selectedNodeIds.length >= 2 && (
              <button type="button" className={styles.linkBtn} onClick={createLinks}>
                Связать ({selectedNodeIds.length})
              </button>
            )}
          </div>
          <div className={styles.mapContainer}>
            <svg
              width={MAP_SIZE}
              height={MAP_SIZE}
              viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
              onContextMenu={e => e.preventDefault()}
              onPointerMove={handleSvgPointerMove}
              onPointerUp={handleSvgPointerUp}
              onPointerLeave={handleSvgPointerUp}
            >
              {/* Связи */}
              {formData.nodes.flatMap(node =>
                node.links.map(link => {
                  const target = formData.nodes.find(n => n.id === link.nodeId);
                  if (!target) return null;

                  const a = gpsToPixel(node.gps);
                  const b = gpsToPixel(target.gps);

                  return (
                    <g
                      key={`${node.id}-${link.nodeId}`}
                      onContextMenu={e => {
                        e.preventDefault(); // ← дублируем для надёжности
                        setUnlinkConfirmation({ from: node, to: target });
                      }}
                    >
                      <line
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke="#b15bff"
                        strokeWidth="2"
                        strokeDasharray="6,4"
                        opacity="0.7"
                      />
                      <circle
                        cx={(a.x + b.x) / 2}
                        cy={(a.y + b.y) / 2}
                        r="6"
                        fill="transparent"
                        stroke="transparent"
                        style={{ cursor: 'context-menu' }}
                      />
                    </g>
                  );
                })
              )}

              {/* Точки */}
              {formData.nodes.map(node => {
                // Берём позицию: сначала из временного состояния, потом из gps
                const tempPos = tempNodePositions[node.id];
                const { x, y } = tempPos
                  ? { x: tempPos.x, y: tempPos.y }
                  : gpsToPixel(node.gps);

                const isSelected = selectedNodeIds.includes(node.id);
                const isStart = node.id === (formData.startNodeId || formData.nodes[0]?.id);

                return (
                  <g
                    key={node.id}
                    data-node-id={node.id}
                    onPointerDown={e => handleNodeDragStart(e, node)}
                    onPointerUp={(e) => {
                      if (e.button === 0) { // ЛКМ
                        // Если зажат Ctrl — редактировать высоту
                        if (e.ctrlKey || e.metaKey) {
                          const altitude = node.gps[2] || 1;
                          setEditingAltitude({
                            nodeId: node.id,
                            nodeName: node.name,
                            altitude: altitude
                          });
                        } else {
                          handleNodeClick(e, node.id);
                        }
                      }
                    }}
                    onPointerEnter={() => setHoveredNodeId(node.id)}
                    onPointerLeave={() => setHoveredNodeId(null)}
                    onContextMenu={e => {
                      e.preventDefault();
                      setFormData(prev => ({ ...prev, startNodeId: node.id }));
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      fill={isSelected ? '#ffd700' : isStart ? '#ff6b00' : '#b15bff'}
                      stroke="#000"
                      strokeWidth="2"
                      className={`${isStart ? 'start-node-pulse' : ''} ${hoveredNodeId === node.id ? 'node-hover' : ''}`}
                    />
                    <text x={x} y={y - 20} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
                      {node.name}
                      {isStart && (
                        <tspan dx="4" fill="#ffd700" fontSize="10">★</tspan>
                      )}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        <small style={{ color: '#aaa', marginLeft: '10px', marginBottom: '16px', display: 'block' }}>
          Ctrl + клик по ноде — изменить высоту
        </small>

        {/* Модалка редактирования высоты */}
        {editingAltitude && (
          <div className={styles.altitudeOverlay}>
            <div className={styles.altitudeModal}>
              <h4>Высота ноды: {editingAltitude.nodeName}</h4>
              <input
                type="range"
                min="-50"
                max="200"
                step="1"
                value={editingAltitude.altitude}
                onChange={(e) => {
                  const newAlt = Number(e.target.value);
                  setEditingAltitude(prev => ({ ...prev, altitude: newAlt }));

                  // ← МГНОВЕННОЕ ОБНОВЛЕНИЕ В ПРЕВЬЮ!
                  setFormData(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n =>
                      n.id === editingAltitude.nodeId
                        ? { ...n, gps: [n.gps[0], n.gps[1], newAlt] }
                        : n
                    )
                  }));
                }}
                style={{ width: '100%' }}
              />
              <div style={{ textAlign: 'center', margin: '10px 0', fontWeight: 'bold' }}>
                {editingAltitude.altitude} м
              </div>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={() => setEditingAltitude(null)}
              >
                Готово
              </button>
            </div>
          </div>
        )}

        {dragState && (
          <div style={{ padding: '10px', background: '#222', color: '#fff', fontFamily: 'monospace' }}>
            Dragging: {dragState.nodeId}<br />
            GPS: {dragState.startGps.map(v => v.toFixed(6)).join(', ')} →{' '}
            {formData.nodes.find(n => n.id === dragState.nodeId)?.gps.map(v => v.toFixed(6)).join(', ') || '...'}
          </div>
        )}

        {/* Предпросмотр */}
        {previewStartNodeId != null && (
          <div className={styles.section}>
            <div className={styles.previewHeader}>
              <h3>
                Предпросмотр тура
                {startNode && <span className={styles.startInfo}> (старт: {startNode.name})</span>}
              </h3>
              <div className={styles.previewActions}>
                <button
                  type="button"
                  className={styles.refreshBtn}
                  onClick={() => {
                    // Полностью пересоздаём viewer с текущими данными
                    handleClosePreview(); // сначала убиваем старый
                    setTimeout(() => {
                      setPreviewStartNodeId(activeStartId); // через тик — чтобы сработал useEffect
                    }, 100);
                  }}
                >
                  Refresh
                </button>
                <button type="button" disabled={closeButtonVisibility ? false : true} className={styles.closeBtn} onClick={handleClosePreview}>
                  Close
                </button>
              </div>
            </div>

            <MiniTourPreview
              containerRef={viewerRef}
            />


            <div className={styles.nodeButtons}>
              {formData.nodes.map(node => (
                <button
                  key={node.id}
                  type="button"
                  className={styles.nodeBtn}
                  data-active={activeStartId === node.id}
                  onClick={() => setPreviewStartNodeId(node.id)}
                >
                  {node.name}
                </button>
              ))}
            </div>
          </div>
        )
        }

        {/* Список нод */}
        <div className={styles.nodesList}>
          {formData.nodes.map(node => (
            <div key={node.id} className={styles.nodeItem}>
              <div>
                <strong>{node.name}</strong> <small>(ID: {node.id})</small>
                <div className={styles.nodeLinks}>
                  Связи: {node.links.length ? node.links.map(l => l.nodeId).join(', ') : '—'}
                </div>
              </div>
              <div className={styles.nodeActions}>
                <button
                  type="button"
                  className={styles.viewBtn}
                  onClick={() => setPreviewStartNodeId(node.id)}
                >
                  View
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => removeNode(node.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ручное добавление */}
        <div className={styles.section}>
          <h3>Добавить вручную</h3>
          <div className={styles.row}>
            <input name="id" placeholder="ID" value={newNode.id} onChange={handleNodeChange} />
            <input name="name" placeholder="Название" value={newNode.name} onChange={handleNodeChange} />
          </div>
          <button type="button" className={styles.addBtn} onClick={() => manualFileInputRef.current?.click()}>
            + Добавить точку вручную
          </button>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn}>{id === 'new' ? 'Создать' : 'Сохранить'}</button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
        </div>
      </form >
      <input
        ref={manualFileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          if (!newNode.id.trim() || !newNode.name.trim()) {
            alert('Заполните ID и Название');
            return;
          }

          try {
            const url = await UploadFile(file, authToken); // ← загружаем

            const node = {
              id: newNode.id,
              name: newNode.name,
              panorama: url,
              thumbnail: url,
              caption: file.name,
              gps: [37.6761, 55.7817, 1],
              sphereCorrection: { pan: 0, roll: 0, tilt: 0 },
              links: [],
            };

            setFormData(prev => ({
              ...prev,
              nodes: [...prev.nodes, node],
              startNodeId: prev.startNodeId || node.id,
            }));

            setPreviewStartNodeId(node.id);
            setNewNode({ id: '', name: '', panorama: '', thumbnail: '', caption: '' });
          } catch (err) {
            alert('Ошибка загрузки файла');
          }
          e.target.value = '';
        }}
      />
    </div >
  );
}