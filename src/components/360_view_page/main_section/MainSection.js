import React from 'react';
import './main_section.css';

const MainSection = ({ isActive }) => {
  
  return (
    <section className={`main-section ${isActive ? 'active' : 'hidden'}`}>
      <div className='header-container'>
        <div>
          <h1>Посмотрим на наши проекты в 360°</h1>
        </div>

      </div>
      <img className={`scroll-gif ${isActive ? 'active' : 'hidden'}`} src='/assets/White_scroll_down.gif'></img>

    </section>
  );
};

export default MainSection;