import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/main_page/MainPage';
import View_360_Page from './components/360_view_page/View_360_page'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/works" element={<p>adsfghjkhgfd</p>} />
        <Route path="/360view" element={<View_360_Page />} />
      </Routes>
    </Router>
  );
}

export default App;
