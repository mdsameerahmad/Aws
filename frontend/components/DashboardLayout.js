// components/DashboardLayout.js

import React, { useState } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar'; // Relative import for Sidebar
import 'bootstrap/dist/css/bootstrap.min.css'; // Keep Bootstrap CSS here if component-specific, or move to _app.js if global

/**
 * DashboardLayout component
 * This component provides the overall layout for dashboard pages,
 * including a sidebar and a main content area.
 * It also manages the sidebar's open/close state.
 */
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Dashboard'); // State to track active section

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F0F2F5' }}>
      <Head>
        <title>GROWTHAFFINITY Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar Component */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setActiveSection={setActiveSection}
        activeSection={activeSection}
      />

      {/* Main Content Area */}
      <div
        className="flex-grow-1 p-3"
        style={{
          marginLeft: isSidebarOpen ? '280px' : '0', // Adjust margin based on sidebar state
          transition: 'margin-left 0.3s ease-in-out', // Smooth transition
          width: '100%', // Ensure it takes full width when sidebar is closed
          boxSizing: 'border-box', // Include padding and border in width calculation
        }}
      >
        {/* Toggle button for sidebar on smaller screens */}
        <button
          className="btn btn-primary d-lg-none mb-3"
          onClick={toggleSidebar}
          style={{ backgroundColor: '#3A86FF', borderColor: '#3A86FF' }}
        >
          <i className="bi bi-list"></i> Toggle Sidebar
        </button>
        {children} {/* Render children (page content) here */}
      </div>

      <style jsx global>{`
        body {
          overflow-x: hidden; /* Prevent horizontal scrolling */
        }
        @media (max-width: 991.98px) {
          .flex-grow-1 {
            margin-left: 0 !important; /* Always reset margin on mobile */
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
