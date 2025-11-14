import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/main_page/MainPage';
import View_360_Page from './components/360_view_page/View_360_page'
import View_360_Project_Page from './components/project_page_360/ProjectPage';
import JustViewPage from './components/just_view_page/JustViewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/360view" element={<View_360_Page />} />
        <Route path="/360view/:id" element={<View_360_Project_Page />} />
        <Route path="/just_view" element={<JustViewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
