import React from 'react';
import "./feedback_page.css"

function MainPage() {

    const handleClick = () => {
        window.location.href = '/';
    }
    return (
        <div className='feedback-container'>
            <div className="header">
                <span className="brand"
                    onClick={handleClick}>
                    <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
                    <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
                    <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
                </span>
                <h2>Оставим заявку на проект</h2>
            </div>
            <div className="feedback-form-container">
                <form className='feedback-form'>
                    <label>
                        Ваше имя:
                        <input type="text" name="name" required />
                    </label>
                    <label>
                        Ваш email:
                        <input type="email" name="email" required />
                    </label>
                    <label>
                        Описание проекта:
                        <textarea name="projectDescription" rows="5" required></textarea>
                    </label>
                    <button type="submit">Отправить заявку</button>
                </form>
            </div>
        </div>

    );
}

export default MainPage;

