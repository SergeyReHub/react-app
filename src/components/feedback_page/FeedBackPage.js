import React, { useState, useRef } from 'react';
import styles from './feedback_page.module.css';

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
  
  const [verificationCode] = useState(
    Math.floor(100000 + Math.random() * 900000).toString()
  );

  const emailInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  const handleClick = () => {
    window.location.href = '/';
  };

  const handleSendCode = () => {
    const email = emailInputRef.current?.value;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    console.log(`Отправляем код на ${email}. Код: ${verificationCode}`);
    setIsCodeSent(true);
    setCodeError(false);
    setTimeout(() => codeInputRef.current?.focus(), 0);
  };

  const handleConfirmCode = () => {
    if (userCode.trim() === verificationCode) {
      setIsEmailConfirmed(true);
      setIsCodeSent(false);
      setUserCode('');
      setCodeError(false);
      setDisappearCodeSent(true);
    } else {
      setCodeError(true);
      alert('Неверный код подтверждения.');
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = nameValue.trim();
    if (name === '') {
      setNameError(true);
      return;
    }

    if (!isEmailConfirmed) {
      setCodeError(true);
      return;
    }

    if (rawPhoneDigits.length !== 10) {
      setPhoneError(true);
      alert('Пожалуйста, введите корректный номер телефона.');
      return;
    }

    const data = {
      name,
      email: emailInputRef.current?.value,
      phone: `+7${rawPhoneDigits}`,
      projectDescription: e.target.projectDescription.value,
    };
    console.log('Форма отправлена:', data);
    alert('Заявка успешно отправлена!');
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
              />
              <div className={styles.codeSection}>
                {!isCodeSent ? (
                  <button
                    type="button"
                    className={`${styles.codeButton} ${
                      disappearCodeSent ? styles.codeButtonDisappear : ''
                    } ${codeError ? styles.inputError : ''}`}
                    onClick={handleSendCode}
                  >
                    отправить код подтверждения
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
                    />
                    <button
                      type="button"
                      className={`${styles.codeButton} ${codeError ? styles.inputError : ''}`}
                      onClick={handleConfirmCode}
                    >
                      подтвердить
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
              />
            </label>
          </div>

          {/* Описание */}
          <div className={`${styles.formGroup} ${styles.descLabel}`}>
            <label>
              Описание проекта:
              <textarea
                name="projectDescription"
                className={styles.textarea}
                rows="5"
                required
              />
            </label>
          </div>

          {/* Отправка */}
          <button
            type="submit"
            className={`${styles.submitButton} ${
              !isEmailConfirmed ? styles.submitButtonDisabled : ''
            }`}
            disabled={!isEmailConfirmed}
          >
            {isEmailConfirmed ? 'Отправить заявку' : 'Подтвердите email, чтобы отправить'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedBackPage;