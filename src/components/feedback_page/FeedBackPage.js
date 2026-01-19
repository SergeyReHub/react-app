// src/components/FeedBackPage.jsx (или где у тебя лежит)
import React, { useState, useRef, useEffect } from 'react';
import styles from './feedback_page.module.css';
import { API_BASE_URL } from '../../config/config';

// ⚙️ Настройки reCAPTCHA Enterprise
const RECAPTCHA_SITE_KEY = '6LeAk0csAAAAAB1TynYZzrHQO_pt9Lu4LNoVR6V-';
const RECAPTCHA_ACTION = 'submit_lead';

function FeedBackPage() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [disappearCodeSent, setDisappearCodeSent] = useState(false);
  const [rawPhoneDigits, setRawPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // 📥 Загружаем скрипт reCAPTCHA при монтировании компонента
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Удаляем скрипт при размонтировании
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleClick = () => {
    window.location.href = '/';
  };

  // 📤 Отправка запроса на получение кода подтверждения
  const handleSendCode = async () => {
    const email = emailInputRef.current?.value;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/leads/email/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
      });

      if (response.ok) {
        setIsCodeSent(true);
        setCodeError(false);
        setTimeout(() => codeInputRef.current?.focus(), 0);
      } else {
        const errorText = await response.text();
        alert(`Ошибка: ${errorText}`);
        setEmailError(true);
      }
    } catch (err) {
      console.error('Ошибка при отправке кода:', err);
      alert('Не удалось отправить код. Проверьте соединение.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Подтверждение кода через API
  const handleConfirmCode = async () => {
    const email = emailInputRef.current?.value;
    const code = userCode.trim();

    if (!code) {
      setCodeError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/leads/email/confirm-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, code }),
      });

      if (response.ok) {
        setIsEmailConfirmed(true);
        setIsCodeSent(false);
        setUserCode('');
        setCodeError(false);
        setDisappearCodeSent(true);
      } else {
        const errorText = await response.text();
        setCodeError(true);
        alert(`Ошибка: ${errorText}`);
      }
    } catch (err) {
      console.error('Ошибка при подтверждении кода:', err);
      alert('Не удалось подтвердить код. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // 📱 Форматирование телефона
  const formatPhone = (digits) => {
    const cleaned = digits.replace(/\D/g, '').slice(0, 10);
    if (cleaned.length === 0) return '+7';
    let formatted = '+7';
    if (cleaned.length >= 1) formatted += ` (${cleaned.slice(0, 3)}`;
    if (cleaned.length > 3) formatted += `) ${cleaned.slice(3, 6)}`;
    if (cleaned.length > 6) formatted += `-${cleaned.slice(6, 8)}`;
    if (cleaned.length > 8) formatted += `-${cleaned.slice(8, 10)}`;
    return formatted;
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    let digitsOnly = input.replace(/\D/g, '');
    if (digitsOnly.startsWith('7')) digitsOnly = digitsOnly.slice(1);
    else if (digitsOnly.startsWith('8')) digitsOnly = digitsOnly.slice(1);
    digitsOnly = digitsOnly.slice(0, 10);
    setRawPhoneDigits(digitsOnly);
    e.target.value = formatPhone(digitsOnly);
    setPhoneError(digitsOnly.length !== 10);
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key.length === 1 && /\D/.test(e.key) && 
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const digits = pasted.replace(/\D/g, '').slice(0, 10);
    e.target.value = formatPhone(digits);
  };

  const handlePhoneFocus = (e) => {
    e.target.value = formatPhone(rawPhoneDigits);
    setTimeout(() => {
      const len = e.target.value.length;
      e.target.setSelectionRange(len, len);
    }, 0);
  };

  // 📤 Отправка заявки с reCAPTCHA
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = nameValue.trim();
    if (name === '') {
      setNameError(true);
      return;
    }

    if (!isEmailConfirmed) {
      setCodeError(true);
      alert('Сначала подтвердите email.');
      return;
    }

    if (rawPhoneDigits.length !== 10) {
      setPhoneError(true);
      alert('Пожалуйста, введите корректный номер телефона.');
      return;
    }

    setLoading(true);
    try {
      // Получаем токен от reCAPTCHA Enterprise
      const recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: RECAPTCHA_ACTION,
      });

      const data = {
        fullName: name,
        email: emailInputRef.current?.value,
        phone: `+7${rawPhoneDigits}`,
        message: e.target.projectDescription.value,
        recaptchaToken,
        recaptchaAction: RECAPTCHA_ACTION,
      };

      const response = await fetch(`${API_BASE_URL}/api/public/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Заявка успешно отправлена:', result);
        alert('Заявка успешно отправлена!');
        // Опционально: сброс формы или редирект
      } else {
        const errorText = await response.text();
        alert(`Ошибка: ${errorText}`);
      }
    } catch (err) {
      console.error('Ошибка при отправке заявки:', err);
      alert('Не удалось отправить заявку. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          className={styles.brand}
          onClick={handleClick}
          aria-label="На главную"
        >
          <span className={styles.brandLetterM}>M</span>
          <span>.</span>
          <span>GROUP</span>
        </button>
        <h2 className={styles.title}>Оставим заявку на проект</h2>
      </header>

      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Имя */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ваше имя:
              <input
                type="text"
                className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                value={nameValue}
                onChange={(e) => {
                  setNameValue(e.target.value);
                  if (e.target.value.trim().length >= 2) setNameError(false);
                }}
                onBlur={() => setNameError(nameValue.trim().length < 2)}
                disabled={loading}
              />
            </label>
          </div>

          {/* Email + код */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ваш email:
              <input
                ref={emailInputRef}
                type="email"
                className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmailError(val !== '' && !/\S+@\S+\.\S+/.test(val));
                }}
                disabled={loading}
              />
              <div className={styles.codeSection}>
                {!isCodeSent ? (
                  <button
                    type="button"
                    className={`${styles.codeButton} ${
                      disappearCodeSent ? styles.codeButtonDisappear : ''
                    } ${codeError ? styles.inputError : ''}`}
                    onClick={handleSendCode}
                    disabled={loading}
                  >
                    {loading ? 'Отправка...' : 'отправить код подтверждения'}
                  </button>
                ) : (
                  <>
                    <input
                      ref={codeInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Код из письма"
                      className={`${styles.codeInput} ${codeError ? styles.inputError : ''}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className={`${styles.codeButton} ${codeError ? styles.inputError : ''}`}
                      onClick={handleConfirmCode}
                      disabled={loading}
                    >
                      {loading ? 'Проверка...' : 'подтвердить'}
                    </button>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Телефон */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ваш номер телефона:
              <input
                ref={phoneInputRef}
                type="tel"
                className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
                value={formatPhone(rawPhoneDigits)}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                onPaste={handlePhonePaste}
                onFocus={handlePhoneFocus}
                inputMode="numeric"
                placeholder="+7 (___) ___-__-__"
                disabled={loading}
              />
            </label>
          </div>

          {/* Описание проекта */}
          <div className={`${styles.formGroup} ${styles.descLabel}`}>
            <label>
              Описание проекта:
              <textarea
                name="projectDescription"
                className={styles.textarea}
                rows="5"
                required
                disabled={loading}
              />
            </label>
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            className={`${styles.submitButton} ${
              !isEmailConfirmed || loading ? styles.submitButtonDisabled : ''
            }`}
            disabled={!isEmailConfirmed || loading}
          >
            {loading 
              ? 'Отправка...' 
              : (isEmailConfirmed ? 'Отправить заявку' : 'Подтвердите email, чтобы отправить')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedBackPage;