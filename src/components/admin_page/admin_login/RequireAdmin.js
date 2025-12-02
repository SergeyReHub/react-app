// src/components/admin/RequireAdmin.js (исправлено имя файла — должно быть RequireAdmin.jsx)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← важно для редиректа из эффекта
import AdminLogin from './AdminLogin';
import styles from './AdminLogin.module.css';

export default function RequireAdmin({ children }) {
    const [isAuth, setIsAuth] = useState(null); // null = checking
    const navigate = useNavigate();

    useEffect(() => {
        // ✅ Имитация проверки без бэкенда
        const check = () => {
            const auth = localStorage.getItem('admin_authenticated') === 'true';
            setIsAuth(auth);
            
        };

        check();
    }, []);

    //   useEffect(() => {
    //     const checkAuth = async () => {
    //       try {
    //         const res = await fetch('/api/admin/check', {
    //           credentials: 'include',
    //         });
    //         const data = await res.json();
    //         if (data.auth === true) {
    //           setIsAuth(true);
    //         } else {
    //           setIsAuth(false);
    //           // 🔁 Дополнительно: если кто-то вручную зашёл на /admin без авторизации — редиректить нельзя, потому что мы уже там.
    //           // Но можно убедиться, что не "застряли":
    //           // Например, если ответ 401 — редирект на /login, но у вас /admin — единственный путь, и логин внутри.
    //         }
    //       } catch {
    //         setIsAuth(false);
    //       }
    //     };

    //     checkAuth();
    //   }, []);

    if (isAuth === null) {
        return <div className={styles.checking}>Проверка доступа...</div>;
    }

    if (!isAuth) {
        return (
            <div className={styles.checking}>
                <AdminLogin />
            </div>
        );
    }

    return children;
}