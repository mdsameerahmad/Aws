// pages/dashboard/index.js
import ProfileCard from '@components/ProfileCard';
import Sidebar from '@components/Sidebar';
import Topbar from '@components/Topbar';
import Products from '@pages/dashboard/products';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import DashboardPage from '../../components/DashboardPage';
import BusinessPage from './business';
import RankRewards from './rank';
import StatusPage from './status';
import WalletPage from './wallet';



export default function Dashboard({ initialUser }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(initialUser);
  const [coins, setCoins] = useState(1000);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('userProfileData');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
    }
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handlePurchase = (cost) => {
    setCoins(prevCoins => prevCoins - cost);
  };

  const sectionComponents = {
    Dashboard: <DashboardPage />,
    Products: <Products searchQuery={searchQuery} coins={coins} onPurchase={handlePurchase} />,
    Business: <BusinessPage />,
    Wallet: <WalletPage />,
    Status: <StatusPage />,
    'Rank & Rewards': <RankRewards />,

    Profile: <ProfileCard user={user} setUser={setUser} />,
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard - GROWTHAFFINITY</title>
        <meta name="description" content="Manage your GROWTHAFFINITY account" />
      </Head>

      <div className="d-flex">
        <Sidebar
          user={user}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />

        <div
          className="flex-grow-1"
          style={{
            marginLeft: isSidebarOpen && window.innerWidth <= 992 ? '0' : '280px',
            transition: 'margin-left 0.3s ease-in-out',
            backgroundColor: '#FFFFFF',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(58, 134, 255, 0.1) 0%, rgba(10, 36, 99, 0.1) 90%)',
            minHeight: '100vh',
            paddingTop: '60px',
          }}
        >
          <Topbar
            toggleSidebar={toggleSidebar}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            coins={coins}
          />
          <main className="p-4">
            {sectionComponents[activeSection] || <DashboardPage />}
          </main>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 992px) {
          .flex-grow-1 {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context) {
  const initialUser = {
    name: 'ERROR',
    email: 'error@gmail.com',
    avatar: null,
    country: 'India',
  };

  return {
    props: {
      initialUser,
    },
  };
}
