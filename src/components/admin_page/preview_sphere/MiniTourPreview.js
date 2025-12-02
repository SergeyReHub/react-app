// MiniTourPreview.jsx — чистый, без эффектов, без destroy
import React from 'react';
import styles from './MiniTourPreview.module.css';

export default function MiniTourPreview({ containerRef }) {
  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.viewer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}