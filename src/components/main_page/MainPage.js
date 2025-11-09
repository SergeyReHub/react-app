import React from 'react';
import OfUs from './of_us_section/OfUs';
import MainSection from './main_section/MainSection';
import ViewCards from './view_cards_section/ViewCards';
import IconsSection from './icons_section/IconsSection';
import ContactSection from './contacts_section/ContactSection';

function MainPage() {
  return (
    <div>
      <MainSection/>
      <OfUs/>
      <ViewCards/>
      <IconsSection/>
      <ContactSection/>
    </div>
  );
}

export default MainPage;
