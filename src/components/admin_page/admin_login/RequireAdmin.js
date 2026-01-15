// src/components/admin/RequireAdmin.js (исправлено имя файла — должно быть RequireAdmin.jsx)
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './AdminLogin.module.css'
import AdminLogin from './AdminLogin';



export default function RequireAdmin({ children }) {
   const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return isAuthenticated ? <Outlet /> :  
            <div className={styles.checking}>
                <AdminLogin />
            </div>
}