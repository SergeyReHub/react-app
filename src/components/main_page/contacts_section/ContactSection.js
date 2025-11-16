import * as React from 'react';
import "./contact_section.css";
import { Link } from 'react-router-dom';


export default function ContactSection() {

    return (
        <Link to='/feedback' className='contact_section'>
            <h1>Готовы создать арт-объект вашей мечты?</h1>
            <p>Поговорим о вашем будущем проекте — минимализм и индустриальный шик в каждом элементе.</p>
            <button className='contact_us'>Обсудить проект</button>
        </Link>
    );
}