import React from 'react';
import './main_section.css';

const MainSection = ({ isActive }) => {
  return (
    <section className={`main-section ${isActive ? 'active' : 'hidden'}`}>
      <h1>Посмотрим на наши проекты в 360°</h1>
    </section>
  );
};

export default MainSection;