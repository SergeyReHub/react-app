import React, { useRef } from 'react';
import OfUs from './of_us_section/OfUs';
import MainSection from './main_section/MainSection';
import ViewCards from './view_cards_section/ViewCards';
import IconsSection from './icons_section/IconsSection';
import ContactSection from './contacts_section/ContactSection';
import LastSection from './last_section/LastSection';
import { useNavigate } from 'react-router-dom';


function MainPage() {
  const navigate = useNavigate();
  // Создаём ref'ы для кнопок
  const examplesButtonRef = useRef(null);
  const view360ButtonRef = useRef(null);
  const contactButtonRef = useRef(null);
  return (
    <div>
      <MainSection
        navigate={navigate}
        examplesButtonRef={examplesButtonRef}
        view360ButtonRef={view360ButtonRef} />
      <OfUs />
      <ViewCards />
      <IconsSection />
      <ContactSection
        navigate={navigate}
        contactButtonRef={contactButtonRef} />
      <LastSection
        navigate={navigate}
        examplesButtonRef={examplesButtonRef}
        view360ButtonRef={view360ButtonRef}
        contactButtonRef={contactButtonRef}/>
    </div>
  );
}

export default MainPage;
