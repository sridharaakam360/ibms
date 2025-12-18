import React, { useState, useEffect } from 'react';
import { AdminProfile, BankAccount } from '../types';
import { useAuth } from '../src/contexts/AuthContext';

interface NavbarProps {
  title: string;
  onMenuClick: () => void;
  adminProfile?: AdminProfile;
  setAdminProfile?: (profile: AdminProfile) => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, onMenuClick, adminProfile, setAdminProfile }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<AdminProfile>({
      name: '', email: '', phone: '', bankAccounts: []
  });

  useEffect(() => {
      if (adminProfile) {
          setFormData(adminProfile);
      }
  }, [adminProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Bank Account Logic for Admin ---
  const handleBankChange = (index: number, field: keyof BankAccount, value: string) => {
      const updatedBanks = [...formData.bankAccounts];
      updatedBanks[index] = { ...updatedBanks[index], [field]: value };
      setFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
  };

  const handleIfscBlur = async (index: number) => {
      const ifsc = formData.bankAccounts[index].ifsc;
      if (ifsc && ifsc.length === 11) {
        try {
          const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
          if (response.ok) {
            const data = await response.json();
            const updatedBanks = [...formData.bankAccounts];
            updatedBanks[index].bankName = data.BANK;
            updatedBanks[index].branch = data.BRANCH;
            setFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
          }
        } catch (error) {
          console.error("Failed to fetch IFSC details", error);
        }
      }
  };

  const addBank = () => {
      setFormData(prev => ({
          ...prev,
          bankAccounts: [...prev.bankAccounts, { 
              id: Math.random().toString(36).substr(2, 9), 
              ifsc: '', bankName: '', branch: '', accountHolderName: '', accountNumber: '' 
          }]
      }));
  };

  const removeBank = (index: number) => {
      const updated = formData.bankAccounts.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, bankAccounts: updated }));
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (setAdminProfile) {
          setAdminProfile(formData);
          setIsProfileOpen(false);
      }
  };

  return (
    <>
    <nav className="sticky top-4 z-20 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/30 p-2 backdrop-blur-xl dark:bg-navy-800/30 mx-4 lg:mx-6 mb-6 border border-white/20 shadow-sm">
      <div className="ml-[6px]">
        <div className="h-6 w-96 pt-1">
          <a className="text-sm font-normal text-navy-700 hover:underline dark:text-white dark:hover:text-white" href="#home">
            Pages
            <span className="mx-1 text-sm text-navy-700 hover:text-navy-700 dark:text-white"> / </span>
          </a>
          <a className="text-sm font-normal capitalize text-navy-700 hover:underline dark:text-white dark:hover:text-white" href="#">
            {title.toLowerCase()}
          </a>
        </div>
        <p className="shrink text-[33px] capitalize text-navy-700 dark:text-white">
          <span className="font-bold tracking-tight text-slate-800 hover:cursor-pointer">{title}</span>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:w-[365px] md:flex-grow-0 md:gap-1 xl:w-[365px] xl:gap-2">
        <div className="flex h-full items-center rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
          <p className="pl-3 pr-2 text-xl">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400 dark:text-white" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </p>
          <input type="text" placeholder="Search..." className="block h-full w-full rounded-full bg-transparent text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:text-white dark:placeholder:!text-white sm:w-fit" />
        </div>

        {/* Menu Toggle for Mobile */}
        <button onClick={onMenuClick} className="lg:hidden text-gray-600">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* Notifications */}
        <span className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M440.5 88.5l-52 52L415 167c9.4 9.4 9.4 24.6 0 33.9l-17.4 17.4c11.8 26.1 18.4 55.1 18.4 85.6 0 114.9-93.1 208-208 208S0 418.9 0 304 93.1 96 208 96c30.5 0 59.5 6.6 85.6 18.4L311 97c9.4-9.4 24.6-9.4 33.9 0l26.5 26.5 52-52 17.1 17z"></path></svg>
        </span>
        
        {/* Profile Dropdown */}
        <div className="relative">
            <div
                className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <div className="h-full w-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            user?.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                    </div>

                    {/* Menu Items */}
                    <button
                        onClick={() => {
                            setIsDropdownOpen(false);
                            setIsProfileOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </button>

                    <button
                        onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            )}
        </div>
      </div>
    </nav>

    {/* Admin Profile Modal */}
    {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-navy-700">Admin Profile & Settings</h3>
                     <button onClick={() => setIsProfileOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                </div>
                
                <form onSubmit={handleSave}>
                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Basic Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                        <div>
                            <h5 className="text-sm font-bold text-gray-700 uppercase">Sender Bank Accounts (Admin)</h5>
                            <p className="text-[10px] text-gray-500">These accounts will be available as "Sender Banks" for all investments.</p>
                        </div>
                        <button type="button" onClick={addBank} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition">+ Add Bank</button>
                    </div>

                    <div className="space-y-4 mb-6">
                        {formData.bankAccounts.map((bank, idx) => (
                            <div key={bank.id || idx} className="bg-gray-50 p-3 rounded-xl border border-gray-200 relative">
                                <button type="button" onClick={() => removeBank(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">IFSC</label>
                                        <input value={bank.ifsc} onChange={(e) => handleBankChange(idx, 'ifsc', e.target.value)} onBlur={() => handleIfscBlur(idx)} className="w-full rounded border px-2 py-1 text-sm" placeholder="IFSC Code" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Bank Name</label>
                                        <input value={bank.bankName} onChange={(e) => handleBankChange(idx, 'bankName', e.target.value)} className="w-full rounded border px-2 py-1 text-sm" placeholder="Bank Name" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Account Number</label>
                                        <input value={bank.accountNumber} onChange={(e) => handleBankChange(idx, 'accountNumber', e.target.value)} className="w-full rounded border px-2 py-1 text-sm" placeholder="Account No." />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Holder Name</label>
                                        <input value={bank.accountHolderName} onChange={(e) => handleBankChange(idx, 'accountHolderName', e.target.value)} className="w-full rounded border px-2 py-1 text-sm" placeholder="Holder Name" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {formData.bankAccounts.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-4 italic">No admin bank accounts added.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setIsProfileOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancel</button>
                        <button type="submit" className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    )}
    </>
  );
};

export default Navbar;