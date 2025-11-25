// src/components/about_us_page/AboutUsPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './about_us.module.css';
import { useNavigate } from 'react-router-dom';

// 🖼️ Фото для слайдера
const SLIDER_IMAGES = [
  { src: "/images/preview.png", alt: "Заливка артбетона в интерьере", caption: "Заливка монолитного пола, объект: офис-лофт, 68 м²" },
  { src: "/images/preview.png", alt: "Шлифовка поверхности", caption: "Ручная шлифовка до класса «зеркало»" },
  { src: "/images/preview.png", alt: "Готовый проект — стена", caption: "Акцентная стена из артбетона, жилой комплекс, Москва" },
  { src: "/images/preview.png", alt: "3D-форма", caption: "Изготовление CNC-опалубки для волнообразной стойки" },
  { src: "/images/preview.png", alt: "Полировка", caption: "Финальная полировка и нанесение защитной пропитки" },
];

export default function AboutUsPage() {
  const navigate = useNavigate();

  // Слайдер
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % SLIDER_IMAGES.length);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length);
  }, [isAnimating]);

  const goToSlide = useCallback((index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
  }, [isAnimating, currentIndex]);

  // Сброс анимации после завершения
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => setIsAnimating(false), 600); // совпадает с CSS
    return () => clearTimeout(timer);
  }, [isAnimating]);

  // Автопрокрутка
  useEffect(() => {
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // 💡 Анимация цифр: появляются при скролле в зону видимости
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [stats, setStats] = useState({
    projects: 0,
    years: 0,
    referrals: 0,
    rating: 0,
  });

  // На странице AboutUsPage / FaqPage — после загрузки контента:
  useEffect(() => {
    // Скроллим наверх при монтировании
    window.scrollTo(0, 0);
  }, []);

  const moveMain = () => {
    navigate("/");
  };

  // Запуск анимации цифр
  const animateStats = useCallback(() => {
    if (statsAnimated) return;
    setStatsAnimated(true);

    // Плавное нарастание
    const duration = 1200;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);

      setStats({
        projects: Math.floor(127 * progress),
        years: Math.floor(25 * progress),
        referrals: Math.floor(98 * progress),
        rating: parseFloat((4.9 * progress).toFixed(1)),
      });

      if (progress < 1) requestAnimationFrame(animate);
    };

    animate();
  }, [statsAnimated]);

  // Intersection Observer для запуска анимации
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateStats();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [animateStats]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 onClick={moveMain} className={styles.heroTitle}>M.GROUP</h1>
          <p className={styles.heroSubtitle}>Искусство в бетоне</p>
          <p className={styles.heroDesc}>
            Мы создаём монолитные архитектурные поверхности, которые служат десятилетиями — без швов, отслоений и потери эстетики.
          </p>
        </div>
      </section>

      {/* 📖 Подробный текст */}
      {/* 🌱 Как всё начиналось */}
      <section className={styles.storySection}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Как всё начиналось</h2>
          <div className={styles.storyContent}>
            <p>
              Всё началось не со стройки, а с холста. Максим — художник, выпускник МГАХИ им. Сурикова.
              Его работы — крупноформатные полотна с текстурой, почти скульптурой. Но однажды его попросили
              сделать <strong>акцентную стену</strong> в интерьере — не картину на стене, а стену как картину.
            </p>
            <p>
              Тогда он впервые попробовал арт-бетон. Не как стройматериал, а как <strong>художественную среду</strong>:
              пластичную, живую, способную держать рельеф, впитывать цвет, отражать свет.
              Получилась стена-скала с прожилками слюды и тёплым янтарным отливом. Заказчик был в восторге.
              А Максим понял: бетон — это новый холст. Только объёмный. Только вечный.
            </p>
            <p>
              Следующие 3 года он экспериментировал: заливал в гараже, искал составы, учился у мастеров из Италии и Израиля,
              ломал шаблоны — делал не полы и не стены, а <strong>объекты</strong>: волны, геоды, обсидиановые столы,
              стойки, «растущие» из пола. Постепенно к нему стали обращаться архитекторы — не за услугой,
              а за <strong>сотрудничеством</strong>.
            </p>
            <p>
              В 2022 году родился <strong>M.GROUP</strong>. Не бригада, не ИП, а команда:
              Максим (технолог и художник), Анна (дизайнер с опытом в премиум-интерьерах),
              Даниил (мастер с 12-летним стажем в монолите) и Елена (инженер по контролю качества).
              Сегодня мы работаем с архитектурными бюро, галереями и частными клиентами —
              от Москвы и Санкт-Петербурга до Казани и Еревана.
            </p>
            <h3>Хотите создать нечто особенное?</h3>
            <p>
              Мы открыты к новым проектам — будь то интерьер, фасад, арт-объект или коллаборация с художником.
              Просто напишите нам - мы всегда на связи и будем рады к новым сотрудничествам!
            </p>
          </div>
        </div>
      </section>

      {/* 🖼️ Слайдер с плавной анимацией */}
      <section className={styles.sliderSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Процесс и реализация</h2>
          <p className={styles.sectionSubtitle}>
            От эскиза до сдачи — 7 этапов, 14 дней, 100% контроль
          </p>
        </div>

        <div className={styles.sliderContainer}>
          {/* Слайды */}
          <div className={styles.slidesWrapper}>
            {SLIDER_IMAGES.map((image, idx) => (
              <div
                key={idx}
                className={`${styles.slide} ${idx === currentIndex
                  ? styles.slideActive
                  : idx === (currentIndex - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length
                    ? styles.slidePrev
                    : idx === (currentIndex + 1) % SLIDER_IMAGES.length
                      ? styles.slideNext
                      : ''
                  }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className={styles.slideImg}
                  loading="lazy"
                />
                <div className={styles.slideCaption}>
                  {image.caption}
                </div>
              </div>
            ))}
          </div>

          {/* Управление */}
          <button className={styles.sliderBtn} onClick={prevSlide} aria-label="Назад">
            ‹
          </button>
          <button className={`${styles.sliderBtn} ${styles.sliderBtnNext}`} onClick={nextSlide} aria-label="Вперёд">
            ›
          </button>

          <div className={styles.sliderDots}>
            {SLIDER_IMAGES.map((_, idx) => (
              <button
                key={idx}
                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Слайд ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 📊 Статистика с анимацией */}
      <section ref={statsRef} className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.projects}</span>
            <span className={styles.statLabel}>реализованных проектов</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.years}+</span>
            <span className={styles.statLabel}>лет в отрасли</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.referrals}%</span>
            <span className={styles.statLabel}>по рекомендации</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.rating}</span>
            <span className={styles.statLabel}>средний рейтинг</span>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Команда</h2>
          <p className={styles.sectionIntro}>
            Над каждым проектом работает 4 специалиста: технолог, мастер-заливщик, шлифовщик и инженер по контролю качества.
          </p>
          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <div className={styles.teamAvatar} aria-hidden="true">
                <span>М</span>
              </div>
              <h3>Максим</h3>
              <p className={styles.teamRole}>Основатель, инженер-технолог</p>
              <p className={styles.teamBio}>
                Опыт 14 лет в монолитном строительстве. Автор 7 патентов на составы артбетона.
              </p>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.teamAvatar} aria-hidden="true">
                <span>А</span>
              </div>
              <h3>Анна</h3>
              <p className={styles.teamRole}>Дизайнер-проектировщик</p>
              <p className={styles.teamBio}>
                Работает с архитекторами: адаптирует эскизы под технологические возможности бетона.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Готовы создать нечто вечное?</h2>
        <p className={styles.ctaDesc}>
          Пришлите ТЗ или фото объекта — за 60 минут пришлём технико-экономическое обоснование.
        </p>
        <div className={styles.ctaButtons}>
          <button
            className={styles.ctaBtnPrimary}
            onClick={() => navigate('/prices_and_conditions')}
          >
            💰 Цены и условия
          </button>

          <button
            className={styles.ctaBtnOutline}
            onClick={() => {
              // Перенаправляем на главную с указанием действия
              navigate('/?action=contact');
            }}
          >
            📞 Связаться с нами
          </button>
        </div>
      </section>
    </div>
  );
}