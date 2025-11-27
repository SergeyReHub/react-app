// src/components/admin/layout/AdminLayout.js
import React from 'react';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ title, children }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1>{title}</h1>
        <div className={styles.user}>
          <span>admin@mgroupp.ru</span>
        </div>
      </header>
      {children}
    </div>
  );
}