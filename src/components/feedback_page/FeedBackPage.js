import React, { useState, useRef } from 'react';
import "./feedback_page.css"

function FeedBackPage() {
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
    const [userCode, setUserCode] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [codeError, setCodeError] = useState(false); // для подсветки
    const [disappearCodeSent, setDisappearCodeSent] = useState(false);

    // Для демо: сгенерируем простой код — можно заменить на серверный
    const [verificationCode] = useState(Math.floor(100000 + Math.random() * 900000).toString());

    const emailInputRef = useRef(null);
    const codeInputRef = useRef(null);

    const handleClick = () => {
        window.location.href = '/';
    };

    const handleSendCode = () => {
        // Здесь можно вызвать API: /api/send-verification-code
        const email = emailInputRef.current?.value;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError(true);
            alert("Пожалуйста, введите корректный email.");
            return;
        }
        else {
            setEmailError(false);
        }

        console.log(`Отправляем код на ${email}. Код: ${verificationCode}`); // для демо
        setIsCodeSent(true);
        setCodeError(false);

        // Фокус на поле ввода кода
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isEmailConfirmed) {
            setCodeError(true);
            // Прокрутим и сфокусируемся на email-блоке
            emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            emailInputRef.current?.focus();
            return;
        }

        // Здесь — отправка формы на сервер
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            projectDescription: formData.get('projectDescription')
        };
        console.log('Форма отправлена:', data);
        alert("Заявка успешно отправлена!");
        // Можно сделать redirect или очистку формы
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
                        <input className="name-input" type="text" name="name" required />
                    </label>

                    <label>
                        Ваш email:
                        <input
                            ref={emailInputRef}
                            className={`email-input ${emailError ? 'error' : ''}`}
                            type="email"
                            name="email"
                            // Убираем `required` — валидация будет ручной
                            onChange={(e) => {
                                const value = e.target.value;
                                // Проверка: если поле не пустое и не соответствует формату — ошибка
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

                    <label>
                        Ваш номер телефона:
                        <input className="phone-input" type="text" name="phone"
                            inputMode="numeric"
                            pattern="[0-9]*" required />
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

