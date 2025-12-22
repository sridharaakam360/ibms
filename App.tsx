import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Investors from './pages/Investors';
import Dashboard from './pages/Dashboard';
import Portfolios from './pages/Portfolios';
import SubMarketors from './pages/SubMarketors';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { ViewState, AdminProfile, BankAccount } from './types';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { adminBanksAPI } from './src/services/api';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.INVESTORS);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: '',
    email: '',
    phone: '',
    bankAccounts: []
  });

  // Fetch admin banks when authenticated
  useEffect(() => {
    const fetchAdminBanks = async () => {
      if (isAuthenticated && isSuperAdmin) {
        try {
          const banks = await adminBanksAPI.getAll();
          // Transform admin banks to match BankAccount type
          const transformedBanks: BankAccount[] = banks.map((bank: any) => ({
            id: bank.id.toString(),
            ifsc: bank.ifsc,
            bankName: bank.bank_name,
            branch: bank.branch,
            accountHolderName: bank.account_holder_name,
            accountNumber: bank.account_number,
            passbookFile: null
          }));
          setAdminProfile(prev => ({ ...prev, bankAccounts: transformedBanks }));
        } catch (error) {
          console.error('Error fetching admin banks:', error);
        }
      }
    };

    fetchAdminBanks();
  }, [isAuthenticated, isSuperAdmin]);

  // Redirect admin users to Investors page on load
  useEffect(() => {
    if (isAuthenticated && !isSuperAdmin) {
      setCurrentView(ViewState.INVESTORS);
    } else if (isAuthenticated && isSuperAdmin) {
      setCurrentView(ViewState.DASHBOARD);
    }
  }, [isAuthenticated, isSuperAdmin]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.INVESTORS:
        return <Investors adminBanks={adminProfile.bankAccounts} />;
      case ViewState.DASHBOARD:
        return isSuperAdmin ? <Dashboard /> : <Investors adminBanks={adminProfile.bankAccounts} />;
      case ViewState.PORTFOLIOS:
        return isSuperAdmin ? <Portfolios /> : <Investors adminBanks={adminProfile.bankAccounts} />;
      case ViewState.SUB_MARKETORS:
        return isSuperAdmin ? <SubMarketors /> : <Investors adminBanks={adminProfile.bankAccounts} />;
      case ViewState.REPORTS:
        return isSuperAdmin ? <Reports /> : <Investors adminBanks={adminProfile.bankAccounts} />;
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
