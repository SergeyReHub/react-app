// src/components/admin/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← добавлено
import styles from './AdminLogin.module.css';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLogin() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // ← добавлено
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });

            const data = await res.json();

            if (res.ok && data.token) {
                // ✅ Сохраняем токен ТОЛЬКО в памяти
                authLogin(data.token);
                navigate('/admin', { replace: true });
            } else {
                setError(data.message || data.error || 'Неверный логин или пароль');
            }
        } catch (err) {
            console.error(err);
            setError('Нет связи с сервером');
        } finally {
            setLoading(false);
        }
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