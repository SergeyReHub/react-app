import "./last_section.css"



export default function LastSection() {
    return (
        <section className="lastSection-container">
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
                    <p>Наша команда поможет воплотить вашу мечту<br/> в реальность!</p>
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
        </section>
    )
}
