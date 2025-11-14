// MainSection.js
import React from "react";
import "./MainSection.css"
import { Link } from 'react-router-dom';

export default function MainSection() {
    return (
        <section
            aria-label="Main hero"
            className="container"
            style={{
                '--main-bg-image': 'url(/images/gif.gif)',
                backgroundImage: 'linear-gradient(to bottom, rgba(137, 43, 131, 0.37) 60%, rgba(0, 0, 0, 1) 100%), var(--main-bg-image, none)'
            }}>
            <div className="overlay" aria-hidden="true">
            </div>
            <div className="content fade-appear-done fade-enter-done">
                <h1 className="title">M. GROUP</h1>
                <p className="subtitle">Искусство в бетоне</p>
                <div className="buttonsContainer">
                    <Link to="/just_view"> {/* Изменил на /works */}
                        <button
                            style={{ backgroundColor: 'white', color: 'black' }}
                            type="button"
                            className="button"
                        >
                            Примеры работ
                        </button>
                    </Link>
                    <Link to="/360view"> {/* Добавил отдельный маршрут */}
                        <button
                            style={{ backgroundColor: 'rgb(25, 25, 25)', color: 'white' }}
                            type="button"
                            className="button"
                        >
                            Просмотр в 360°
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    )
}