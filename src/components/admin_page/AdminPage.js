// src/components/admin/AdminPage.js
import React, { useState } from 'react';
import styles from './AdminPage.module.css';
import AdminLayout from './layout/AdminLayout';
import AdminSidebar from './sidebar/AdminSidebar';
import Projects360List from './projects-360/Projects360List';
import ProjectsFlatList from './projects-flat/ProjectsFlatList';
import FaqList from './faq/FaqList';
import LeadList from './leads/LeadList';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('360'); // '360', 'flat', 'faq'

  const renderContent = () => {
    switch (activeTab) {
      case 'flat': return <ProjectsFlatList />;
      case 'faq': return <FaqList />;
      case '360': return <Projects360List />;
      case 'lead': return <LeadList/>
    }
  };

  return (
    <AdminLayout title="Админка M.GROUP">
      <div className={styles.container}>
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className={styles.main}>{renderContent()}</main>
      </div>
    </AdminLayout>
  );
}