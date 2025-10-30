import React from 'react';
import OfUs from './components/of_us_section/OfUs';
import MainSection from './components/main_section/MainSection';
import ViewCards from './components/view_cards_section/ViewCards';
import IconsSection from './components/icons_section/IconsSection';

function App() {
  return (
    <div className="App">
      <MainSection/>
      <OfUs/>
      <ViewCards/>
      <IconsSection/>
    </div>
  );
}

export default App;
