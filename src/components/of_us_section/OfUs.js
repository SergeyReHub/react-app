import "./ofUs.css"
import preview from './sources/preview.png'



export default function OfUs() {

    
    return (
        <section id="of-us" aria-label="About us section" className="ofUsSectionContainer">
            <div className='ofUsContainer'>
                <div className='ofUsTextContainer'>
                    <h1>
                        Бетон, в котором живет искусство.
                    </h1>
                    <p>
                        M. GROUP создает уникальные
                        арт-объекты и мебель из бетона. <br />
                        Мы соединяем индустриальный
                        шик, минимализм и современные
                        технологии. <br />
                        Подчеркиваем индивидуальность в каждой детали.
                    </p>
                </div>
                <div className='ofUsImageContainer'>
                    <img src={preview} alt="Of us" />
                </div>
            </div>
            <div className='ourExpertsContainer'>
                <div className='ourExpertsImageContainer'>
                    <img src={preview} alt="Of us" />
                </div>
                <div className='ourExpertsTextContainer'>
                    <h1>
                        Наша экспертиза
                    </h1>
                    <p>
                        Арт-объекты для интерьера, бетонная мебель, ландшафтный дизайн, публичные инсталляции. Наша команда превращает бетон в нечто большее, чем просто материал.
                    </p>
                </div>
            </div>
            <div className='filosophyContainer'>
                <div className='filosophyTextContainer'>
                    <h1>
                        Философия
                    </h1>
                    <p>
                        Эстетика фактуры, прочность и экологичность, рождающие индивидуальный премиальный продукт. Мы — за смелые решения и грубую элегантность!
                    </p>
                </div>
                <div className='filosophyImageContainer'>
                    <img src={preview} alt="Of us" />
                </div>

            </div>
        </section>
    )
}
