import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Investors from './pages/Investors';
import Dashboard from './pages/Dashboard';
import Portfolios from './pages/Portfolios';
import Reports from './pages/Reports';
import { ViewState, AdminProfile } from './types';
import { INITIAL_ADMIN_PROFILE } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(INITIAL_ADMIN_PROFILE);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.INVESTORS:
        return <Investors adminBanks={adminProfile.bankAccounts} />;
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.PORTFOLIOS:
        return <Portfolios />;
      case ViewState.REPORTS:
        return <Reports />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main className="mx-auto min-h-screen w-full p-4 md:p-6 lg:p-8">
            <Navbar 
                title={currentView.toLowerCase()} 
                onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
                adminProfile={adminProfile}
                setAdminProfile={setAdminProfile}
            />
            
            <div className="mt-4">
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;