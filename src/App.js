import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/main_page/MainPage';
import View_360_Page from './components/360_view_page/View_360_page'
import View_360_Project_Page from './components/project_page_360/ProjectPage';
import JustViewPage from './components/just_view_page/JustViewPage';
import JustViewProjectPage from './components/project_page_just_view/SingleProjectPage';
import FeedBackPage from './components/feedback_page/FeedBackPage';
import PricesAndConditions from './components/prices_page/PricesPage';
import FaqPage from './components/faq_page/FaqPage';
import AboutUs from './components/about_us_page/AboutUs'
import AdminPage from './components/admin_page/AdminPage'
import RequireAdmin from './components/admin_page/admin_login/RequireAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/360view" element={<View_360_Page />} />
        <Route path="/360view/:id" element={<View_360_Project_Page />} />
        <Route path="/just_view" element={<JustViewPage />} />
        <Route path="/just_view/:id" element={<JustViewProjectPage />} />
        <Route path="/feedback" element={<FeedBackPage />} />
        <Route path="/prices_and_conditions" element={<PricesAndConditions />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path='/about' element={<AboutUs />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin/*" element={<AdminPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
