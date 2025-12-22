import React from 'react';
import { ViewState } from '../types';
import { useAuth } from '../src/contexts/AuthContext';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const IconHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconBriefcase = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const IconSubMarketors = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="18" y1="8" x2="22" y2="8"/></svg>;
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const { isSuperAdmin } = useAuth();

  const allLinks = [
    { id: ViewState.DASHBOARD, name: 'Dashboard', icon: <IconHome />, requiresSuperAdmin: true },
    { id: ViewState.INVESTORS, name: 'Investors', icon: <IconUsers />, requiresSuperAdmin: false },
    { id: ViewState.PORTFOLIOS, name: 'Portfolios', icon: <IconBriefcase />, requiresSuperAdmin: true },
    { id: ViewState.SUB_MARKETORS, name: 'Sub-Marketors', icon: <IconSubMarketors />, requiresSuperAdmin: true },
    { id: ViewState.REPORTS, name: 'Reports', icon: <IconChart />, requiresSuperAdmin: true },
  ];

  // Filter links based on user role
  const links = allLinks.filter(link => !link.requiresSuperAdmin || isSuperAdmin);

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-center h-20 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          HORIZON <span className="text-gray-400 font-medium">IBMS</span>
        </h1>
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {links.map((link) => {
          const isActive = currentView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                onChangeView(link.id);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <span className={`mr-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {link.icon}
              </span>
              {link.name}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;