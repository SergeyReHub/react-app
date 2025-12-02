// src/components/admin/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← добавлено
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // ← добавлено

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            localStorage.setItem('admin_authenticated', 'true');
            setLoading(false);
            // ✅ Просто перезагружаем текущую страницу — RequireAdmin перепроверит
            window.location.href = '/admin';
        }, 300);

        // try {
        //     const res = await fetch('/api/admin/login', {
        //         method: 'POST',
        //         credentials: 'include',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ login, password })
        //     });

        //     const data = await res.json();

        //     if (res.ok) {
        //         // ✅ Перенаправляем без перезагрузки
        //         navigate('/admin', { replace: true }); // ← replace: true вместо push
        //     } else {
        //         setError(data.error || 'Ошибка входа');
        //     }
        // } catch {
        //       setError('Нет связи с сервером');
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <div className={styles.loginCard}>
            <h2>Вход в админку</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
}