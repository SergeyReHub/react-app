// src/components/faq_page/FaqPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './faq_page.css';

const FAQ_API_URL = '/api/faq';
const SUBMIT_QUESTION_URL = '/api/faq/ask';

// 🎯 Тестовые (резервные) данные — если бэк недоступен
const FALLBACK_FAQS = [
  // ... (оставьте ваш существующий массив из 10 вопросов — он не изменился)
  {
    id: 'f1',
    question: 'Какова минимальная площадь заказа?',
    answer: '<p>Минимальная площадь — <strong>15 м²</strong>. Это связано с технологией заливки: меньшие объёмы не обеспечивают равномерное распределение состава и риска расслоения.</p>',
  },
  {
    id: 'f2',
    question: 'Можно ли залить артбетон поверх тёплого пола?',
    answer: '<p>Да, можно — при соблюдении условий:<br/>• Максимальная температура поверхности — не выше <strong>+28°C</strong> во время заливки и 72 ч после;<br/>• Используется специальная пропитка-адгезив;<br/>• В смете указывается опция «Интеграция с ТП» (+600 ₽/м²).</p>',
  },
  {
    id: 'f3',
    question: 'Сколько служит покрытие из артбетона?',
    answer: '<p>При соблюдении условий эксплуатации — <strong>25+ лет</strong>. Гарантия: 2 года на работу, 5 лет — на материалы. В паспорте изделия указывается дата заливки и состав смеси.</p>',
  },
  {
    id: 'f4',
    question: 'Чем полированный бетон отличается от наливного пола?',
    answer: '<p>Это принципиально разные технологии:<br/>• <strong>Артбетон</strong> — монолитная конструкция толщиной 30–100 мм, армированная, несущая;<br/>• <strong>Наливной пол</strong> — тонкослойное покрытие (3–8 мм) поверх стяжки.<br/>Артбетон прочнее, долговечнее и ремонтопригоден (можно отшлифовать заново).</p>',
  },
  {
    id: 'f5',
    question: 'Есть ли запах во время работ?',
    answer: '<p>Нет. Все составы — на водной основе, без растворителей. Во время шлифовки используется промышленный пылесос с HEPA-фильтром. Объект пригоден для пребывания сразу после завершения работ.</p>',
  },
  {
    id: 'f6',
    question: 'Работаете ли вы по договору и с НДС?',
    answer: '<p>Да. Предоставляем:<br/>• Договор подряда / ГПД;<br/>• СНП / КС-2, КС-3;<br/>• Счёт-фактуру с НДС 20% (или без НДС по УСН);<br/>• Реквизиты ИП / ООО — по запросу.</p>',
  },
  {
    id: 'f7',
    question: 'Сколько времени сохнет бетон?',
    answer: '<p>Хождение — через <strong>24 часа</strong>, монтаж мебели — через <strong>72 часа</strong>, полная нагрузка — через <strong>28 суток</strong>. Финальная полировка и пропитка — на 14–21 сутки.</p>',
  },
  {
    id: 'f8',
    question: 'Можно ли сделать криволинейные формы?',
    answer: '<p>Да. С помощью CNC-фрезерованных опалубок из композита мы создаём:<br/>• Волны, арки, консоли;<br/>• Интегрированную мебель (столы, скамьи, барные стойки);<br/>• 3D-рельеф (до 8 см высотой).</p>',
  },
  {
    id: 'f9',
    question: 'Нужно ли согласовывать с ЖЭКом?',
    answer: '<p>Для жилых помещений — <strong>не требуется</strong>, если не затрагиваются несущие конструкции. Для коммерческих объектов — по ТЗ заказчика (мы предоставляем техническое заключение).</p>',
  },
  {
    id: 'f10',
    question: 'Где можно посмотреть реальные объекты?',
    answer: '<p>Три варианта:<br/>1. <a href="/just_view">Фото и видео</a> в разделе «Примеры работ»;<br/>2. <a href="/360view">Интерактивные 360° панорамы</a>;<br/>3. Выезд на готовый объект в Москве — по предварительной записи.</p>',
  },
];

export default function FaqPage() {
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState([]); // изначально пусто — резерв подгрузим после проверки
  const [loading, setLoading] = useState(true);
  const [fromFallback, setFromFallback] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // только если API жив

  const [openIndex, setOpenIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: '',
  });

  const askFormRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  // === Загрузка порции вопросов (page ≥ 1) ===
  const loadFaqs = async (pageNum) => {
    if (!hasMore || !loading) return;

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${FAQ_API_URL}?page=${pageNum}&limit=10`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 🔹 Сначала проверяем статус и тип контента
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ Получен не-JSON (возможно, капча). Используем fallback.');
        throw new Error('not_json');
      }

      // 🔹 Только теперь парсим
      const data = await res.json();

      if (!Array.isArray(data.items)) {
        throw new Error('invalid_format');
      }

      setFaqs((prev) => [...prev, ...data.items]);
      setHasMore(data.items.length === 10);
      setPage(pageNum);
      setFromFallback(false);
    } catch (err) {
      console.error('Загрузка FAQ прервана:', err.message || err);

      // 🔹 ГАРАНТИРОВАННО выходим из loading
      if (pageNum === 1) {
        // Первая страница → fallback
        setFaqs(FALLBACK_FAQS);
        setHasMore(false);
        setFromFallback(true);
      }
      // Для page > 1 — просто останавливаем подгрузку, но не меняем список
    } finally {
      // 🔹 КРИТИЧЕСКИ ВАЖНО: всегда снимаем loading
      setLoading(false);
    }
  };

  // === Первая загрузка ===
  useEffect(() => {
    loadFaqs(1);
  }, []);

  useEffect(() => {
    // Скроллим наверх при монтировании
    window.scrollTo(0, 0);
  }, []);

  // === Бесконечный скролл (только если API работает) ===
  useEffect(() => {
    if (!hasMore || fromFallback) return; // fallback → нет пагинации

    const handleScroll = () => {
      if (loading) return;

      const trigger = scrollTriggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      // Скроллим, когда триггер в 200px от низа viewport
      if (rect.top < window.innerHeight + 200) {
        loadFaqs(page + 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page, fromFallback]);

  // === Скролл к форме ===
  const scrollToAskForm = () => {
    askFormRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // === Обработчики ===
  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const { name, email, question } = formData;
    if (!name.trim() || !email.trim() || !question.trim()) {
      setSubmitError('Пожалуйста, заполните все поля.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setSubmitError('Некорректный email.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(SUBMIT_QUESTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, question }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text();
        if (text.includes('SmartCaptcha') || res.status === 403) {
          throw new Error('captcha');
        }
        throw new Error(`HTTP ${res.status}`);
      }

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', question: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error('Submit failed:', err);

      if (err.name === 'AbortError') {
        setSubmitError('Превышено время ожидания. Попробуйте позже.');
      } else if (err.message === 'captcha') {
        setSubmitError(
          'Ваш запрос был заблокирован системой безопасности. ' +
          'Попробуйте отправить вопрос через Telegram или WhatsApp.'
        );
      } else {
        setSubmitError(
          'Не удалось отправить вопрос. ' +
          'Возможно, временные неполадки— напишите нам напрямую:'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goToPrices = () => navigate('/prices_and_conditions');
  const goToExamples = () => navigate('/?action=examples');

  const openTelegram = () => {
    window.open('https://t.me/+79774517692', '_blank', 'noopener,noreferrer');
  };
  const openWhatsApp = () => {
    window.open('https://wa.me/79774517692', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="full-faq-page">
      <div className="faq-page">
        <div className="faq-page__hero">
          <h1>Вопросы и ответы</h1>
          <p className="faq-page__subtitle">
            Здесь собраны ответы на частые вопросы о работе с артбетоном.
            Не нашли нужное?
          </p>
          {/* ✅ Кнопка "Задать свой вопрос" */}
          <button
            onClick={scrollToAskForm}
            className="faq-page__ask-top-btn"
            aria-label="Задать свой вопрос"
          >
            Задать свой вопрос
          </button>
        </div>

        {fromFallback && !loading && (
          <div className="faq-page__fallback-notice">
            📡 Данные временно загружены из кэша (сервер недоступен).
          </div>
        )}

        <div className="faq-page__list">
          {faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`faq-page__item ${openIndex === index ? 'faq-page__item--open' : ''}`}
              >
                <button
                  className="faq-page__question"
                  onClick={() => toggleQuestion(index)}
                  aria-expanded={openIndex === index}
                >
                  <span className="faq-page__question-text">{faq.question}</span>
                  <span className="faq-page__toggle">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>
                <div className="faq-page__answer">
                  <div dangerouslySetInnerHTML={{ __html: faq.answer || faq.answerText }} />
                </div>
              </div>
            ))
          ) : loading ? (
            <div className="faq-page__loader">Загрузка вопросов…</div>
          ) : (
            <div className="faq-page__empty">Вопросов пока нет.</div>
          )}

          {/* Триггер для бесконечного скролла */}
          {hasMore && !fromFallback && <div ref={scrollTriggerRef} style={{ height: '1px' }} />}
          {loading && page > 1 && (
            <div className="faq-page__loader-more">Загружаем ещё вопросы…</div>
          )}
        </div>

        {/* === Форма — задать вопрос === */}
        <section ref={askFormRef} className="faq-page__ask">
          <h2 className="faq-page__ask-title">Задайте свой вопрос</h2>
          <p className="faq-page__ask-desc">
            Мы ответим по email в течение 24 часов и, возможно, добавим его в FAQ.
          </p>

          {submitSuccess && (
            <div className="faq-page__success">
              ✅ Спасибо! Ваш вопрос принят. Ответ придёт на почту в течение 24 часов.
            </div>
          )}

          {submitError && (
            <div className="faq-page__form-error">
              <p>{submitError}</p>
              {submitError.includes('напрямую') && (
                <div className="faq-page__fallback-contacts">
                  <button onClick={openTelegram} className="faq-page__contact-btn telegram">
                    Telegram
                  </button>
                  <button onClick={openWhatsApp} className="faq-page__contact-btn whatsapp">
                    WhatsApp
                  </button>
                </div>
              )}
            </div>
          )}

          <form className="faq-page__form" onSubmit={handleSubmit}>
            <div className="faq-page__form-group">
              <label htmlFor="name">Имя *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="faq-page__form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="faq-page__form-group">
              <label htmlFor="question">Ваш вопрос *</label>
              <textarea
                id="question"
                name="question"
                rows="4"
                value={formData.question}
                onChange={handleInputChange}
                required
              />
            </div>
            <button
              type="submit"
              className="faq-page__submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Отправка…' : 'Отправить вопрос'}
            </button>
          </form>

          <div className="faq-page__help-links">
            <button onClick={goToPrices} className="faq-page__link-btn">
              💰 Цены и условия
            </button>
            <button onClick={goToExamples} className="faq-page__link-btn">
              🖼 Примеры работ
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}