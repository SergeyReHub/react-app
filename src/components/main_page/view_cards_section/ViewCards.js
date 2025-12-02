import "./viewCards.css"
import preview from './sources/preview.png'
import { useState } from 'react'


export default function ViewCards({

}) {
    const [hoveredCard, setHoveredCard] = useState(null)

    const handleCardHover = (cardIndex) => {
        setHoveredCard(cardIndex)
    }

    const handleCardLeave = () => {
        setHoveredCard(null)
    }

    const getContainerClass = () => {
        switch (hoveredCard) {
            case 0: return 'left-card-hover'
            case 1: return 'central-card-hover'
            case 2: return 'right-card-hover'
            default: return ''
        }
    }
    return (
        <section id="view-cards" aria-label="About us section" className={`viewCardsContainer ${getContainerClass()}`}>
            <h2 className="viewCardsHeading">
                Мы работаем со всем
            </h2>
            <div className='gridCardsContainer'>
                <div className='cardItem'>
                    <div className="cardImage"
                        style={{
                            // set CSS var used by the stylesheet
                            '--card-image': `url(${preview})`,
                        }}
                        onMouseEnter={() => handleCardHover(0)}
                        onMouseLeave={handleCardLeave}>
                        <p>Интерьер</p>
                    </div>

                    <h1>Арт-объекты</h1>
                </div>
                <div className='cardItem'>
                    <div className="cardImage"
                        style={{
                            // set CSS var used by the stylesheet
                            '--card-image': `url(${preview})`,
                        }}
                        onMouseEnter={() => handleCardHover(1)}
                        onMouseLeave={handleCardLeave}>
                        <p>Мебель</p>
                    </div>

                    <h1>Монолит</h1>
                </div>
                <div className='cardItem'>
                    <div className="cardImage"
                        style={{
                            // set CSS var used by the stylesheet
                            '--card-image': `url(${preview})`,
                        }}
                        onMouseEnter={() => handleCardHover(2)}
                        onMouseLeave={handleCardLeave}>
                        <p>Ландшафт</p>
                    </div>
                    <h1>Инсталляции</h1>
                </div>
            </div>

        </section>
    )
}
