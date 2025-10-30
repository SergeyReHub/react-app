import React from "react";
import "./IconsSection.css"

import ShieldIcon from '@mui/icons-material/ShieldTwoTone';




export default function IconsSection() {
    return (
        <section className="iconsSectionContainer" aria-label="Icons section">
            <div className="iconItem">
                <ShieldIcon style={{ fontSize: 50, color: 'gray' }} />
                <h2>Прочность</h2>
                <p>Наш бетон выдерживает экстремальные нагрузки и сохраняет свою целостность на протяжении многих лет.</p>
            </div>
            <div className="iconItem">
                <ShieldIcon style={{ fontSize: 50, color: '#2196F3' }} />
                <h2>Экологичность</h2>
                <p>Мы используем экологически чистые материалы и технологии, минимизируя воздействие на окружающую среду.</p>
            </div>
            <div className="iconItem">
                <ShieldIcon style={{ fontSize: 50, color: '#FF9800' }} />
                <h2>Индивидуальность</h2>
                <p>Каждый наш проект уникален и отражает индивидуальный стиль и предпочтения наших клиентов.</p>
            </div>
        </section>
    )
}
