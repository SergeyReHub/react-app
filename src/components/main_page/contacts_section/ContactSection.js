import * as React from 'react';
import "./contact_section.css";


export default function ContactSection({ navigate, contactButtonRef }) {
    const moveTeFeedBack = () => {
        navigate('/feedback');
    }
    return (
        <div className='contact_section'>
            <h1>Готовы создать арт-объект вашей мечты?</h1>
            <p>Поговорим о вашем будущем проекте — минимализм и индустриальный шик в каждом элементе.</p>
            <button
                ref={contactButtonRef}
                onClick={moveTeFeedBack}
                className='contact_us'>Обсудить проект</button>
        </div>
    );
}