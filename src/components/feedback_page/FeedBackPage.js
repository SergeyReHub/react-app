import React, { useState, useRef } from 'react';
import "./feedback_page.css";

function FeedBackPage() {
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
    const [userCode, setUserCode] = useState('');
    const [nameValue, setNameValue] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [codeError, setCodeError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [disappearCodeSent, setDisappearCodeSent] = useState(false);

    // Для телефона
    const [rawPhoneDigits, setRawPhoneDigits] = useState(''); // только цифры (до 10)
    const [phoneError, setPhoneError] = useState(false);

    // Для демо: код
    const [verificationCode] = useState(Math.floor(100000 + Math.random() * 900000).toString());

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
            alert("Пожалуйста, введите корректный email.");
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
            alert("Неверный код подтверждения.");
        }
    };

    // Форматирование телефона: "+7 (XXX) XXX-XX-XX"
    // Чистая функция форматирования: НИКАКИХ setState!
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
        // Получаем введённый текст
        let input = e.target.value;

        // Удаляем всё, кроме цифр (включая +7, если вдруг ввели)
        let digitsOnly = input.replace(/\D/g, '');

        // Если в начале был +7 — уберём его (мы сами добавим)
        if (digitsOnly.startsWith('7')) {
            digitsOnly = digitsOnly.slice(1);
        } else if (digitsOnly.startsWith('8')) {
            digitsOnly = digitsOnly.slice(1);
        }
        // Оставляем максимум 10 цифр
        digitsOnly = digitsOnly.slice(0, 10);

        // Обновляем состояние — только здесь!
        setRawPhoneDigits(digitsOnly);

        // Форматируем и устанавливаем значение в input
        const formatted = formatPhone(digitsOnly);
        e.target.value = formatted;

        // Валидация
        const isValid = digitsOnly.length === 10;
        setPhoneError(!isValid);
    };

    const handlePhoneKeyDown = (e) => {
        // Запрещаем ввод букв и спецсимволов, кроме Backspace/Delete
        if (e.key.length === 1 && /\D/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
            e.preventDefault();
        }
    };

    const handlePhonePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        const digits = pasted.replace(/\D/g, '').slice(0, 10);
        const formatted = formatPhone(digits);
        e.target.value = formatted;
    };

    // Фокус — вставляем курсор в конец
    const handlePhoneFocus = (e) => {
        // Убедимся, что значение актуально
        e.target.value = formatPhone(rawPhoneDigits);
        // Переместим каретку в конец
        setTimeout(() => {
            const len = e.target.value.length;
            e.target.setSelectionRange(len, len);
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Валидация имени
        const name = e.target.name.value.trim();
        if (name === '') {
            setNameError(true);
            e.target.name.scrollIntoView({ behavior: 'smooth', block: 'center' });
            e.target.name.focus();
            return;
        }

        // Валидация email
        if (!isEmailConfirmed) {
            setCodeError(true);
            emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            emailInputRef.current?.focus();
            return;
        }

        // Валидация телефона
        if (rawPhoneDigits.length !== 10) {
            setPhoneError(true);
            phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            phoneInputRef.current?.focus();
            alert("Пожалуйста, введите корректный номер телефона.");
            return;
        }

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: `+7${rawPhoneDigits}`, // сохраняем как +7XXXXXXXXXX
            projectDescription: formData.get('projectDescription')
        };
        console.log('Форма отправлена:', data);
        alert("Заявка успешно отправлена!");
    };
    

    return (
        <div className='feedback-container'>
            <div className="header">
                <span className="brand" onClick={handleClick}>
                    <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
                    <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
                    <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
                </span>
                <h2>Оставим заявку на проект</h2>
            </div>

            <div className="feedback-form-container">
                <form className='feedback-form' onSubmit={handleSubmit}>
                    <label>
                        Ваше имя:
                        <input className={`name-input ${nameError ? 'error' : ''}`}
                            type="text"
                            name="name"
                            value={nameValue}
                            onChange={(e) => {
                                const val = e.target.value;
                                setNameValue(val);
                                if (val.trim().length >= 2) {
                                    setNameError(false); // сбрасываем ошибку при вводе
                                }
                            }}
                            onBlur={(e) => {
                                const val = e.target.value.trim();
                                setNameError(val.length < 2);
                            }}
                            required />
                    </label>

                    <label>
                        Ваш email:
                        <input
                            ref={emailInputRef}
                            className={`email-input ${emailError ? 'error' : ''}`}
                            type="email"
                            name="email"
                            onChange={(e) => {
                                const value = e.target.value;
                                const isValid = /\S+@\S+\.\S+/.test(value);
                                setEmailError(value !== '' && !isValid);
                            }}
                        />
                        <div className="email-submit-block">
                            {!isCodeSent ? (
                                <button
                                    type="button"
                                    className={`email-submit-button ${disappearCodeSent ? 'disappear' : ''} ${codeError ? 'error' : ''}`}
                                    onClick={handleSendCode}
                                    title="Нажмите чтобы отправить код подтверждения на email"
                                >
                                    отправить код подтверждения
                                </button>
                            ) : (
                                <>
                                    <input
                                        ref={codeInputRef}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength="6"
                                        value={userCode}
                                        onChange={(e) => setUserCode(e.target.value)}
                                        placeholder="Код из письма"
                                        className={`verification-input ${codeError ? 'error' : ''}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={`email-submit-button ${codeError ? 'error' : ''}`}
                                        onClick={handleConfirmCode}
                                        title="Подтвердите код из письма"
                                    >
                                        подтвердить
                                    </button>
                                </>
                            )}
                        </div>
                    </label>

                    {/* Телефон */}
                    <label htmlFor="phone">
                        Ваш номер телефона:
                        <input
                            ref={phoneInputRef}
                            id="phone"
                            name="phone"
                            type="tel"
                            className={`phone-input ${phoneError ? 'error' : ''}`}
                            onChange={handlePhoneChange}
                            value={formatPhone(rawPhoneDigits)}
                            onKeyDown={handlePhoneKeyDown}
                            onPaste={handlePhonePaste}
                            onFocus={handlePhoneFocus}
                            autoComplete="tel"
                            inputMode="numeric"
                            placeholder="+7 (___) ___-__-__"
                        />
                    </label>

                    <label className='desc-label'>
                        Описание проекта:
                        <textarea
                            className="project-description-input"
                            name="projectDescription"
                            rows="5"
                            required
                        ></textarea>
                    </label>

                    <button
                        type="submit"
                        className={`submit-button ${!isEmailConfirmed ? 'disabled' : ''}`}
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