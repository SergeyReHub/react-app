// src/components/admin/sidebar/AdminSidebar.js
import React from 'react';
import styles from './AdminSidebar.module.css';

export default function AdminSidebar({ activeTab, onTabChange }) {
  const tabs = [
    { id: '360', label: '360° Проекты', icon: '🌐' },
    { id: 'flat', label: 'Фото-проекты', icon: '🖼️' },
    { id: 'faq', label: 'Вопросы и ответы', icon: '❓' },
  ];

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>M.GROUP Admin</h2>
      <nav className={styles.nav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.navIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))} 
      </nav>
    </aside>
  );
}