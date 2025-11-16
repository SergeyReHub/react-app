import "./last_section.css"



export default function LastSection() {
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
                    <div className="three-messager-icons">
                        <span className="icon">
                            <img src="/assets/icons8-telegram.svg" alt="telegram" />
                        </span>
                        <span className="icon top-icon">
                            <img id="whatsapp" src="/assets/whatsapp-logo-4463.svg" alt="whatsapp" />
                        </span>
                        <span className="icon bottom-icon">
                            <img src="/assets/mail_ru_logo_icon_147267.svg" alt="mail" />
                        </span>
                    </div>
                </div>
                <div className="clicks-block">
                    <div className="one-click-block">
                        <h3>Компания</h3>
                        <p>О нас</p>
                        <p>Поддержка</p>
                        <p>Примеры работ</p>
                    </div>
                    <div className="one-click-block">
                        <h3>Контакты</h3>
                        <p>Связаться</p>
                        <p>Адрес</p>
                        <p>Соцсети</p>
                    </div>
                    <div className="one-click-block">
                        <h3>Полезное</h3>
                        <p>Отзывы</p>
                        <p>Проекты</p>
                        <p>FAQ</p>
                    </div>
                </div>

            </div>
            <div className="footer-block">
                <span>© 2024 M.GROUP. Все права защищены.</span>
                <span>ИП: Максим Сергеев</span>
            </div>
        </section>
    )
}
