import React, { useRef, useState, useEffect } from "react";
import "./last_section.css";
import { useLocation } from "react-router-dom";



export default function LastSection({ navigate,
    examplesButtonRef,
    view360ButtonRef,
    contactButtonRef
}) {
    const [isAddressVisible, setIsAddressVisible] = useState(false);
    const addressTriggerRef = useRef(null);
    const addressPopupRef = useRef(null);
    const imgsContainerRef = useRef(null);
    const location = useLocation();

    const navigateToPrices = () => {
        navigate('/prices_and_conditions');
    };

    const moveToAboutUsPage = () => {
        navigate('/about');
    };

    const moveToFaq = () => {
        navigate('/faq');
    };

    const moveToExamples = () => {
        const button1 = examplesButtonRef?.current;
        const button2 = view360ButtonRef?.current;
        if (!button1 || !button2) return;

        // 1. Прокручиваем к кнопке
        button1.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // 2. Добавляем класс анимации
        setTimeout(() => {
            button1.classList.add('pulse-highlight');
            button2.classList.add('pulse-highlight');
        }, 1000);

        // 3. Убираем класс через 1.5 секунды (длительность анимации)
        setTimeout(() => {
            button1.classList.remove('pulse-highlight');
            button2.classList.remove('pulse-highlight');
        }, 7000);
    };

    const underlineContactButtons = () => {
        const button = contactButtonRef?.current;
        if (!button) return;

        // === 1. Прокрутка к зоне контактов ===
        // Ищем оба ключевых элемента
        const contactUsButton = document.querySelector('.contact_us');
        const messagersBlock = document.querySelector('.messagers-icons-block');

        if (contactUsButton && messagersBlock) {
            // Вычисляем среднюю позицию между ними по вертикали
            const top1 = contactUsButton.getBoundingClientRect().top + window.scrollY;
            const top2 = messagersBlock.getBoundingClientRect().top + window.scrollY;
            const midY = (top1 + top2) / 2 - window.innerHeight / 2 + 100; // центрируем немного выше середины экрана

            // Плавная прокрутка
            window.scrollTo({
                top: midY,
                behavior: 'smooth',
            });

            // Добавляем небольшую задержку перед анимацией, чтобы прокрутка завершилась
            setTimeout(() => {
                triggerAnimation(button);
            }, 600);
        } else {
            // Если элементы не найдены — всё равно запускаем анимацию (например, при SSR или lazy-load)
            triggerAnimation(button);
        }
    };

    // Вспомогательная функция — сама анимация
    const triggerAnimation = (button) => {
        button.classList.add('underline-highlight');

        const imgsContainer = imgsContainerRef?.current;
        if (imgsContainer) {
            imgsContainer.classList.add('for-imgs');

            const imgs = imgsContainer.querySelectorAll('span');
            imgs.forEach((img, index) => {
                setTimeout(() => {
                    img.style.transform = 'scale(1.2)';
                    img.style.transition = 'transform 0.5s ease';
                    setTimeout(() => {
                        img.style.transform = 'scale(1)';
                    }, 800);
                }, index * 300);
            });

            // Убираем классы через 12 сек
            setTimeout(() => {
                button.classList.remove('underline-highlight');
                if (imgsContainer) {
                    imgsContainer.classList.remove('for-imgs');
                }
            }, 12000);
        }
    };

    const underlineSocialsButtons = () => {
        const imgsConstainer = imgsContainerRef?.current;
        if (!imgsConstainer) return;
        imgsConstainer.classList.add('for-imgs');

        const imgs = imgsConstainer?.querySelectorAll('span');
        imgs.forEach((img, index) => {
            // Добавляем класс анимации с задержкой
            setTimeout(() => {
                img.style.transform = 'scale(1.2)';
                img.style.transition = 'transform 0.5s ease';
                setTimeout(() => {
                    img.style.transform = 'scale(1)';
                }, 800);
            }, index * 300);
        });
        setTimeout(() => {
            imgsConstainer.classList.remove('for-imgs');
        }, 2000);

    };

    const toggleAddress = () => {
        setIsAddressVisible(prev => !prev);
    };

    const showReviewsDialog = () => {

    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'contact') {
            // 1. Чистим URL, не перезагружая страницу
            navigate('/', { replace: true });

            // 2. Запускаем анимацию в следующем тике — после полного монтирования
            const timer = setTimeout(() => {
                underlineContactButtons();
            }, 100); // 100 мс достаточно для рендеринга DOM

            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                isAddressVisible &&
                !addressTriggerRef.current?.contains(e.target) &&
                !addressPopupRef.current?.contains(e.target)
            ) {
                setIsAddressVisible(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsAddressVisible(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isAddressVisible]);

    // Opens Telegram chat/channel in a new tab.
    // Replace `YourTelegramUsername` with your actual t.me username (without @).
    const telegramHandler = () => {
        const url = 'https://t.me/+79774517692';
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Opens WhatsApp chat. Replace phone number with full international number (no +, e.g. 79991234567).
    // You can include a prefilled message using the `text` param.
    const whatsappHandler = () => {
        const phone = '79774517692'; // <-- replace with your number
        const text = encodeURIComponent('Здравствуйте! Хочу узнать подробности.');
        const url = `https://wa.me/${phone}?text=${text}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Opens user's mail client with a prefilled email. Replace address/subject/body as needed.
    const mailHandler = () => {
        const address = 'info@example.com'; // <-- replace with real email
        const subject = encodeURIComponent('Вопрос с сайта');
        const body = encodeURIComponent('Здравствуйте,%0D%0AХотел бы узнать...');
        const mailto = `mailto:${address}?subject=${subject}&body=${body}`;
        // Using window.location to invoke mail client.
        window.location.href = mailto;
    };

    // Opens Avito (or a listing/company page) in a new tab. Replace with the actual Avito URL.
    const avitoHandler = () => {
        const url = 'https://www.avito.ru/moskva/predlozheniya_uslug/skala_v_interere_aktsentnaya_stena_artbeton_3431330522'; // <-- replace with real Avito URL
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    return (
        <section className="lastSection-container">
            <div className="lastSection-main">
                <div className="beauty-block">
                    <div className="beauty-block-header">
                        <span className="brand">
                            <span style={{ color: 'rgba(253, 69, 69, 1)' }}>M</span>
                            <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
                            <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
                        </span>

                    </div>
                    <div className="nadpisi">
                        <h2>Воплащаем в жизнь вашу мечту!</h2>
                        <p>Наша команда поможет воплотить вашу мечту<br /> в реальность!</p>
                    </div>
                </div>
                <div className="messagers-icons-block">
                    <div ref={imgsContainerRef} className="three-messager-icons">
                        <span className="icon">
                            <img
                                onClick={telegramHandler}
                                src="/assets/icons8-telegram.svg" alt="telegram" />
                        </span>
                        <span className="icon top-icon">
                            <img
                                onClick={whatsappHandler}
                                id="whatsapp" src="/assets/whatsapp-logo-4463.svg" alt="whatsapp" />
                        </span>
                        <span className="icon bottom-icon">
                            <img
                                onClick={mailHandler}
                                src="/assets/mail_ru_logo_icon_147267.svg" alt="mail" />
                        </span>
                        <span className="icon bottom-icon">
                            <svg
                                onClick={avitoHandler}
                                x="0px" y="0px"
                                viewBox="0 0 600 600" >
                                <g>
                                    <g>
                                        <circle class="st0" cx="423.3" cy="423.3" r="156.3" />
                                        <circle class="st1" cx="128.6" cy="423.3" r="73.2" />
                                        <circle class="st2" cx="423.3" cy="128.6" r="100.9" />
                                        <circle class="st3" cx="128.6" cy="128.6" r="128.6" />
                                    </g>
                                </g>
                            </svg>
                        </span>
                    </div>
                </div>
                <div className="clicks-block">
                    <div className="one-click-block">
                        <h3>Компания</h3>
                        <p onClick={moveToAboutUsPage}>
                            О нас</p>
                        <p
                            onClick={navigateToPrices}
                            className="lighted-like-important">
                            Цены и условия</p>
                        <p onClick={moveToExamples}>Примеры работ</p>
                    </div>
                    <div className="one-click-block">
                        <h3>Контакты</h3>
                        <p onClick={underlineContactButtons}>Связаться</p>
                        <p
                            ref={addressTriggerRef}
                            onClick={toggleAddress}
                            className="address-trigger"
                        >
                            Адрес</p>
                        <p onClick={underlineSocialsButtons}>Соцсети</p>
                    </div>
                    <div className="one-click-block">
                        <h3>Полезное</h3>
                        <p onClick={showReviewsDialog}>Отзывы</p>
                        <p onClick={moveToAboutUsPage}>Поддержка</p>
                        <p onClick={moveToFaq}>Вопросы и ответы</p>
                    </div>
                </div>
                {isAddressVisible && (
                    <div
                        ref={addressPopupRef}
                        className="address-popup"
                        style={{
                            // Позиционируем динамически через JS или CSS-in-JS
                            // Но для простоты — делаем через CSS (см. ниже)
                        }}
                    >
                        <div className="address-popup-content">
                            <button
                                className="address-popup-close"
                                onClick={() => setIsAddressVisible(false)}
                                aria-label="Закрыть"
                            >
                                ✕
                            </button>
                            <h4>Наш адрес</h4>
                            <p>
                                📍 <strong>г. Москва, ул. Липецкая, д. 34/25, кв. 143</strong>
                            </p>
                            <p>Работаем по предварительной записи</p>
                            <button
                                className="address-popup-button"
                                onClick={() => {
                                    // Можно открыть в Яндекс.Картах или Google Maps
                                    window.open(
                                        'https://yandex.ru/maps/?text=Москва,+ул.+Липецкая,+34/25',
                                        '_blank'
                                    );
                                }}
                            >
                                Открыть в картах
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="footer-block">
                <span>© 2024 M.GROUP. Все права защищены.</span>
                <span>ИП: Максим Сергеев</span>
            </div>
        </section>
    )
}
