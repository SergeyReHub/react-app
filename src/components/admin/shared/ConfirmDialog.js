// src/components/admin/shared/ConfirmDialog.js
import React from 'react';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Отмена
          </button>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}