// src/components/prices_page/PricesPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './prices_page.css';

// ——— ДАННЫЕ ———
const CONCRETE_TYPES = [
    { id: 'polished', name: 'Полированный бетон', basePrice: 2800, desc: 'Гладкая поверхность с зеркальным блеском' },
    { id: 'acid', name: 'Кислотный бетон', basePrice: 3500, desc: 'Уникальные оттенки за счёт химической реакции' },
    { id: 'terrazzo', name: 'Терраццо', basePrice: 5200, desc: 'Мраморная крошка в белом бетоне', highlight: true },
    { id: 'colored', name: 'Интегральный цвет', basePrice: 2400, desc: 'Пигмент вводится в смесь — цвет «на всю глубину»' },
];

const WORK_STAGES = [
    { step: 1, title: 'Консультация и замер', desc: 'Бесплатный выезд инженера в пределах МКАД. Анализ основания, фотофиксация, рекомендации по подготовке.' },
    { step: 2, title: 'Коммерческое предложение', desc: 'Детальный расчёт с разбивкой по статьям. Срок — до 24 часов.' },
    { step: 3, title: 'Подписание договора', desc: 'Договор оказания услуг по 223-ФЗ (для госзаказчиков) или в свободной форме. Приложение — смета и ТЗ.' },
    { step: 4, title: 'Выполнение работ', desc: 'Поэтапная съёмка видео/фото. Промежуточные акты — при необходимости.' },
    { step: 5, title: 'Сдача-приёмка', desc: 'Подписание акта выполненных работ (форма КС-2/КС-3 или унифицированная). Передача паспорта изделия.' },
];

const CONTRACT_TERMS = [
    { title: 'Форма договора', desc: 'Гражданско-правовой договор / Договор подряда / Госконтракт (223-ФЗ)' },
    { title: 'Оплата', desc: '30% — предоплата, 60% — по факту укладки, 10% — при подписании акта. Безналичный расчёт.' },
    { title: 'НДС', desc: 'Работаем с НДС и без НДС (УСН). Выставляем счёт-фактуру.' },
    { title: 'Документы', desc: 'Акт выполненных работ, смета, паспорт изделия (состав бетона, марка, толщина, дата заливки).' },
];

const GUARANTEES = [
    { title: 'Гарантия', desc: '24 месяца на работу. 5 лет — на материалы (при условии соблюдения эксплуатационных требований).' },
    { title: 'Сроки', desc: 'Стандарт: 7–14 дней для 50 м². Срочно: +30% к стоимости — исполнение за 3–5 дней.' },
    { title: 'Ответственность', desc: 'Штраф 0.1% от стоимости за каждый день просрочки (прописано в договоре).' },
    { title: 'Возврат', desc: 'Предоплата возвращается в полном объёме, если отказ до начала работ.' },
];

export default function PricesPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('prices'); // 'prices' | 'stages' | 'contract' | 'guarantees'

    const handleRequest = () => {
        alert('📩 Отправьте запрос на design@mgroupp.ru — пришлите площадь, фото помещения и пожелания. Ответим за 45 минут.');
    };

    const navToMain = () => {
        navigate('/');
    };

    return (
        <div className="prices-full">
            <div className="prices-max-width">
                {/* Hero */}
                <div className="prices-full__hero">
                    <div className="header">
                        <span className="brand"
                            onClick={navToMain}>
                            <span style={{ color: '#d42920ff' }}>M</span>
                            <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
                            <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
                        </span>
                    </div>
                    <h1>Цены и условия сотрудничества</h1>
                    <p className="prices-full__subtitle">
                        Прозрачные расценки, чёткий регламент и юридическая надёжность — для архитекторов, подрядчиков и частных клиентов.
                    </p>
                </div>

                {/* Tabs / Nav */}
                <nav className="prices-full__tabs">
                    <button
                        className={`prices-full__tab ${activeTab === 'prices' ? 'prices-full__tab--active' : ''}`}
                        onClick={() => setActiveTab('prices')}
                    >
                        📊 Цены
                    </button>
                    <button
                        className={`prices-full__tab ${activeTab === 'stages' ? 'prices-full__tab--active' : ''}`}
                        onClick={() => setActiveTab('stages')}
                    >
                        🔄 Этапы работ
                    </button>
                    <button
                        className={`prices-full__tab ${activeTab === 'contract' ? 'prices-full__tab--active' : ''}`}
                        onClick={() => setActiveTab('contract')}
                    >
                        📝 Условия
                    </button>
                    <button
                        className={`prices-full__tab ${activeTab === 'guarantees' ? 'prices-full__tab--active' : ''}`}
                        onClick={() => setActiveTab('guarantees')}
                    >
                        🛡 Гарантии
                    </button>
                </nav>

                {/* Content */}
                <div className="prices-full__content">
                    {/* ——— ЦЕНЫ ——— */}
                    {activeTab === 'prices' && (
                        <>
                            <p className="prices-full__intro">
                                Стоимость указана за <strong>1 м²</strong> готовой поверхности. Включено: материалы, работа, финишная обработка.
                            </p>
                            <div className="prices-full__grid">
                                {CONCRETE_TYPES.map((type) => (
                                    <div
                                        key={type.id}
                                        className={`prices-full__card ${type.highlight ? 'prices-full__card--highlight' : ''}`}
                                    >
                                        <h3>{type.name}</h3>
                                        <p className="prices-full__card-desc">{type.desc}</p>
                                        <div className="prices-full__price">
                                            <span className="prices-full__price-value">{type.basePrice.toLocaleString()}</span>
                                            <span className="prices-full__price-unit">₽ / м²</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ——— ЭТАПЫ ——— */}
                    {activeTab === 'stages' && (
                        <div className="prices-full__stages">
                            {WORK_STAGES.map((stage) => (
                                <div key={stage.step} className="prices-full__stage">
                                    <div className="prices-full__stage-number">{stage.step}</div>
                                    <div>
                                        <h3 className="prices-full__stage-title">{stage.title}</h3>
                                        <p>{stage.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ——— УСЛОВИЯ ——— */}
                    {activeTab === 'contract' && (
                        <div className="prices-full__terms">
                            {CONTRACT_TERMS.map((term, i) => (
                                <div key={i} className="prices-full__term-item">
                                    <h4>{term.title}</h4>
                                    <p>{term.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ——— ГАРАНТИИ ——— */}
                    {activeTab === 'guarantees' && (
                        <div className="prices-full__guarantees">
                            {GUARANTEES.map((g, i) => (
                                <div key={i} className="prices-full__guarantee-item">
                                    <h4>{g.title}</h4>
                                    <p>{g.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Общий CTA */}
                    <div className="prices-full__cta-section">
                        <h2 className="prices-full__cta-title">Готовы начать?</h2>
                        <p>Получите точный расчёт и коммерческое предложение за <strong>1 час</strong>.</p>
                        <button className="prices-full__cta-btn" onClick={handleRequest}>
                            Отправить запрос
                        </button>
                        <p className="prices-full__contact-note">
                            Или позвоните: <a href="tel:+74951234567">+7 (495) 123-45-67</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}