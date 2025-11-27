// src/components/admin/projects-360/Project360Form.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './Project360Form.module.css';
import MiniTourPreview from '../preview_sphere/MiniTourPreview';

const EMPTY_PROJECT = { id: Date.now().toString(), title: '', description: '', nodes: [] };
const MAP_SIZE = 400;
const MAP_CENTER = MAP_SIZE / 2;
const MAP_SCALE = 8000; // 0.01° ≈ 1.1 км → 800 пикселей

export default function Project360Form({ id, initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || EMPTY_PROJECT);
  const [newNode, setNewNode] = useState({ id: '', name: '', panorama: '', thumbnail: '', caption: '' });
  const [previewStartNodeId, setPreviewStartNodeId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const [dragState, setDragState] = useState(null); // { nodeId, startX, startY, startGps }

  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [unlinkConfirmation, setUnlinkConfirmation] = useState(null); // { from, to }
  const dragOffset = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef(null);


  // Глобальные обработчики (в useEffect)
  useEffect(() => {
    const handleDrag = (e) => {
      if (!draggedNodeId) return;

      const svg = document.querySelector(`.${styles.mapContainer} svg`);
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse());

      const newX = x - dragOffset.current.x;
      const newY = y - dragOffset.current.y;

      // Обновляем GPS в состоянии
      setFormData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggedNodeId
            ? { ...n, gps: pixelToGps({ x: newX, y: newY }) }
            : n
        )
      }));
    };

    const handleDragEnd = () => {
      setDraggedNodeId(null);
    };

    window.addEventListener('pointermove', handleDrag);
    window.addEventListener('pointerup', handleDragEnd);
    window.addEventListener('pointercancel', handleDragEnd);

    return () => {
      window.removeEventListener('pointermove', handleDrag);
      window.removeEventListener('pointerup', handleDragEnd);
      window.removeEventListener('pointercancel', handleDragEnd);
    };
  }, [draggedNodeId, formData.nodes]);

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

  const uploadFiles = (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    const newNodes = imageFiles.map((file, i) => {
      const nodeId = `node_${Date.now()}_${i}`;
      const lat = 55.7817 + (Math.random() - 0.5) * 0.04;
      const lon = 37.6761 + (Math.random() - 0.5) * 0.04;

      return {
        id: nodeId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        panorama: URL.createObjectURL(file),
        thumbnail: URL.createObjectURL(file),
        caption: file.name,
        gps: [lon, lat, 1 + i * 0.1], // ← ИСПРАВЛЕНО: lon, lat (долгота, широта)
        sphereCorrection: { pan: '0deg' },
        links: [],
      };
    });

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
    setFormData(prev => ({
      ...prev,
      nodes: prev.nodes
        .filter(n => n.id !== nodeId)
        .map(n => ({ ...n, links: n.links.filter(l => l.nodeId !== nodeId) }))
    }));
    if (previewStartNodeId === nodeId) setPreviewStartNodeId(formData.nodes[0]?.id || null);
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


  // === Ручное добавление ===
  const addManualNode = () => {
    if (!newNode.id.trim() || !newNode.name.trim() || !newNode.panorama.trim()) {
      alert('Заполните ID, Название и Панораму');
      return;
    }
    const node = { ...newNode, links: [], gps: [37.6761, 55.7817, 1], sphereCorrection: { pan: '0deg' } };
    setFormData(prev => ({ ...prev, nodes: [...prev.nodes, node] }));
    setPreviewStartNodeId(node.id);
    setNewNode({ id: '', name: '', panorama: '', thumbnail: '', caption: '' });
  };

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNodeChange = e => setNewNode(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? '/api/admin/projects-360' : `/api/admin/projects-360/${id}`;
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
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

  // GPS → SVG
  const gpsToPixel = ([lon, lat]) => ({
    x: MAP_CENTER + (lon - 37.6761) * MAP_SCALE,
    y: MAP_CENTER - (lat - 55.7817) * MAP_SCALE,
  });
  const pixelToGps = ({ x, y }) => [
    37.6761 + (x - MAP_CENTER) / MAP_SCALE,
    55.7817 - (y - MAP_CENTER) / MAP_SCALE,
    1 // height по умолчанию
  ];

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

    // Рассчитываем смещение
    const dx = x - dragState.startX;
    const dy = y - dragState.startY;

    // Новая позиция в пикселях
    const newX = dragState.startX + dx;
    const newY = dragState.startY + dy;

    // Переводим в GPS
    const newGps = pixelToGps({ x: newX, y: newY });

    // Обновляем ТОЛЬКО одну ноду — быстро и без дрожания
    setFormData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === dragState.nodeId ? { ...n, gps: newGps } : n
      )
    }));
  };

  // Завершение — сбрасываем состояние
  const handleSvgPointerUp = () => {
    setDragState(null);
  };

  return (
    <div className={styles.formCard}>
      <h2>{id === 'new' ? 'Новый 360° проект' : 'Редактировать проект'}</h2>

      <form onSubmit={handleSubmit}>
        {/* Основные поля */}
        <div className={styles.formGroup}>
          <label>ID проекта</label>
          <input name="id" value={formData.id} onChange={handleChange} required disabled={id !== 'new'} />
        </div>
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
                const { x, y } = gpsToPixel(node.gps);
                const isSelected = selectedNodeIds.includes(node.id);
                const isStart = node.id === (formData.startNodeId || formData.nodes[0]?.id);

                return (
                  <g
                    key={node.id}
                    data-node-id={node.id}
                    onPointerDown={e => handleNodeDragStart(e, node)}
                    onPointerUp={e => handleNodeClick(e, node.id)}
                    onPointerEnter={() => setHoveredNodeId(node.id)}
                    onPointerLeave={() => setHoveredNodeId(null)}
                    onContextMenu={e => {
                      e.preventDefault(); // ← для точек тоже
                      // ПКМ по точке — сделать стартовой (если хотите)
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
                <button type="button" className={styles.refreshBtn} onClick={() => setPreviewStartNodeId(activeStartId)}>
                  Refresh
                </button>
                <button type="button" className={styles.closeBtn} onClick={() => setPreviewStartNodeId(null)}>
                  Close
                </button>
              </div>
            </div>

            <MiniTourPreview
              nodes={formData.nodes}
              startNodeId={activeStartId}
              key={`${previewStartNodeId}-${nodesHash}`}
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
        )}

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
          <input name="panorama" placeholder="/path/to/pano.jpg" value={newNode.panorama} onChange={handleNodeChange} style={{ marginTop: 8, width: '100%' }} />
          <button type="button" className={styles.addBtn} onClick={addManualNode}>+ Добавить точку</button>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn}>{id === 'new' ? 'Создать' : 'Сохранить'}</button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
        </div>
      </form>
    </div>
  );
}