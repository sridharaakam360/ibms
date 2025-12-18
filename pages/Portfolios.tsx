import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table, { Column } from '../components/Table';
import { Portfolio, SubMarketor, BankAccount, Investor } from '../types';
import { portfoliosAPI, investorsAPI } from '../src/services/api';

const INITIAL_BANK_STATE: BankAccount = {
    id: '',
    ifsc: '',
    bankName: '',
    branch: '',
    accountHolderName: '',
    accountNumber: '',
    passbookFile: null
};

const INITIAL_FORM_STATE: Portfolio = {
    id: '',
    name: '',
    description: '',
    email: '',
    phone: '',
    totalRaised: '0',
    investorCount: 0,
    defaultCommissionRate: 0,
    logo: null,
    subMarketors: [],
    pan: '',
    aadhar: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bankAccounts: [{ ...INITIAL_BANK_STATE, id: 'main_bank_init' }]
};

const INITIAL_SUB_MARKETOR_STATE: SubMarketor = {
    id: '',
    name: '',
    phone: '',
    email: '',
    pan: '',
    aadhar: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    commissionRate: 0,
    bankAccounts: [{ ...INITIAL_BANK_STATE, id: 'sub_bank_init' }]
};

const Portfolios: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Portfolio>(INITIAL_FORM_STATE);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dashboard view state
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedSubMarketor, setSelectedSubMarketor] = useState<{ sub: SubMarketor; parent: Portfolio } | null>(null);
  
  // Sub-marketer form state (Modal)
  const [showSubForm, setShowSubForm] = useState(false);
  const [subFormData, setSubFormData] = useState<SubMarketor>(INITIAL_SUB_MARKETOR_STATE);
  const [isEditingSub, setIsEditingSub] = useState(false);

  const formatCurrency = (amount: string) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount));
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (index: number, field: keyof BankAccount, value: string) => {
    const updatedBanks = [...formData.bankAccounts];
    updatedBanks[index] = { ...updatedBanks[index], [field]: value };
    setFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
  };

  const handlePortfolioBankIfscBlur = async (index: number) => {
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

  const handleBankFileChange = (index: number, file: File) => {
    const updatedBanks = [...formData.bankAccounts];
    updatedBanks[index] = { ...updatedBanks[index], passbookFile: file };
    setFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
  };

  const addPortfolioBank = () => {
    setFormData(prev => ({
        ...prev,
        bankAccounts: [...prev.bankAccounts, { ...INITIAL_BANK_STATE, id: Math.random().toString(36).substr(2, 9) }]
    }));
  };

  const removePortfolioBank = (index: number) => {
    setFormData(prev => ({
        ...prev,
        bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFormData(prev => ({ ...prev, logo: e.target.files![0] }));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (isEditing) {
            // No dedicated update endpoint for portfolios in API, keep local update
            setPortfolios(prev => prev.map(p => p.id === formData.id ? formData : p));
            if (selectedPortfolio && selectedPortfolio.id === formData.id) {
                setSelectedPortfolio(formData);
            }
        } else {
            // Create portfolio on server - send ALL fields including bank accounts
            const payload = {
                name: formData.name,
                description: formData.description || '',
                email: formData.email || '',
                phone: formData.phone || '',
                pan: formData.pan || '',
                aadhar: formData.aadhar || '',
                address: formData.address || '',
                city: formData.city || '',
                state: formData.state || '',
                pincode: formData.pincode || '',
                defaultCommissionRate: formData.defaultCommissionRate || 0,
                logoFile: null, // TODO: Will add file upload later
                bankAccounts: formData.bankAccounts.map(bank => ({
                    ifsc: bank.ifsc || '',
                    bankName: bank.bankName || '',
                    branch: bank.branch || '',
                    accountHolderName: bank.accountHolderName || '',
                    accountNumber: bank.accountNumber || '',
                    passbookFile: null // TODO: Will add file upload later
                }))
            };
            const res = await portfoliosAPI.create(payload);
            // Refetch portfolios
            const fresh = await portfoliosAPI.getAll();
            setPortfolios(fresh || []);
            alert('Portfolio created successfully');
        }
        handleCancel();
    } catch (err: any) {
        console.error('Failed to save portfolio', err);
        alert((err && err.message) ? (err.message + '\n(You need super admin privileges to create a portfolio)') : 'Failed to save portfolio');
    }
  };

  const handleEdit = (portfolio: Portfolio) => {
      const safePortfolio = {
          ...portfolio,
          bankAccounts: (portfolio.bankAccounts && portfolio.bankAccounts.length > 0) 
            ? portfolio.bankAccounts 
            : [{ ...INITIAL_BANK_STATE, id: `bank_${portfolio.id}` }]
      };
      setFormData(safePortfolio);
      setIsEditing(true);
      setShowForm(true);
      setSelectedPortfolio(null);
  };

  const handleCancel = () => {
      setShowForm(false);
      setIsEditing(false);
      setFormData(INITIAL_FORM_STATE);
  };

  // Fetch portfolios & investors from backend
  useEffect(() => {
      const fetchData = async () => {
          try {
              const [p, i] = await Promise.all([portfoliosAPI.getAll(), investorsAPI.getAll()]);
              setPortfolios(p || []);
              setInvestors(i || []);
          } catch (err) {
              console.error('Failed to fetch portfolios/investors', err);
          }
      };
      fetchData();
  }, []);

  // Sub-Marketer Handlers
  const handleSubInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setSubFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubBankChange = (index: number, field: keyof BankAccount, value: string) => {
    const updatedBanks = [...subFormData.bankAccounts];
    updatedBanks[index] = { ...updatedBanks[index], [field]: value };
    setSubFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
  };

  const handleSubBankIfscBlur = async (index: number) => {
    const ifsc = subFormData.bankAccounts[index].ifsc;
    if (ifsc && ifsc.length === 11) {
      try {
        const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
        if (response.ok) {
          const data = await response.json();
          const updatedBanks = [...subFormData.bankAccounts];
          updatedBanks[index].bankName = data.BANK;
          updatedBanks[index].branch = data.BRANCH;
          setSubFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
        }
      } catch (error) {
        console.error("Failed to fetch IFSC details", error);
      }
    }
  };

  const handleSubBankFileChange = (index: number, file: File) => {
    const updatedBanks = [...subFormData.bankAccounts];
    updatedBanks[index] = { ...updatedBanks[index], passbookFile: file };
    setSubFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
  };

  const addSubBank = () => {
    setSubFormData(prev => ({
        ...prev,
        bankAccounts: [...prev.bankAccounts, { ...INITIAL_BANK_STATE, id: Math.random().toString(36).substr(2, 9) }]
    }));
  };

  const removeSubBank = (index: number) => {
    setSubFormData(prev => ({
        ...prev,
        bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
  };

  const handleSaveSubMarketor = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPortfolio) return;

      try {
          if (isEditingSub) {
              // Local update only (no update endpoint for sub-marketors)
              const updatedSubMarketors = selectedPortfolio.subMarketors.map(s => s.id === subFormData.id ? subFormData : s);
              const updatedPortfolio = { ...selectedPortfolio, subMarketors: updatedSubMarketors };
              setPortfolios(prev => prev.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p));
              setSelectedPortfolio(updatedPortfolio);
          } else {
              // Create sub-marketor on server - send ALL fields including bank accounts
              const payload = {
                  name: subFormData.name,
                  email: subFormData.email || '',
                  mobile: subFormData.phone || '',
                  pan: subFormData.pan || '',
                  aadhar: subFormData.aadhar || '',
                  address: subFormData.address || '',
                  city: subFormData.city || '',
                  state: subFormData.state || '',
                  pincode: subFormData.pincode || '',
                  commissionRate: subFormData.commissionRate || 0,
                  bankAccounts: subFormData.bankAccounts.map(bank => ({
                      ifsc: bank.ifsc || '',
                      bankName: bank.bankName || '',
                      branch: bank.branch || '',
                      accountHolderName: bank.accountHolderName || '',
                      accountNumber: bank.accountNumber || '',
                      passbookFile: null // TODO: Will add file upload later
                  }))
              };
              await portfoliosAPI.addSubMarketor(selectedPortfolio.id, payload);
              // Refetch portfolios to get the new sub-marketor
              const fresh = await portfoliosAPI.getAll();
              setPortfolios(fresh || []);
              const updated = fresh.find(p => p.id === selectedPortfolio.id);
              if (updated) setSelectedPortfolio(updated);
              alert('Sub-marketer created successfully');
          }
      } catch (err: any) {
          console.error('Failed to save sub-marketor', err);
          alert((err && err.message) ? (err.message + '\n(You need super admin privileges to create a sub-marketer)') : 'Failed to save sub-marketor');
      } finally {
          setSubFormData(INITIAL_SUB_MARKETOR_STATE);
          setShowSubForm(false);
          setIsEditingSub(false);
      }
  };
  
  const handleEditSubMarketor = (sub: SubMarketor) => {
       const safeSub = {
          ...sub,
          bankAccounts: (sub.bankAccounts && sub.bankAccounts.length > 0) 
            ? sub.bankAccounts 
            : [{ ...INITIAL_BANK_STATE, id: `sub_bank_${sub.id}` }]
      };
      setSubFormData(safeSub);
      setIsEditingSub(true);
      setShowSubForm(true);
  };

  const removeSubMarketor = (subId: string) => {
      if (!selectedPortfolio) return;
      if (window.confirm("Are you sure you want to remove this sub-marketer?")) {
        const updatedPortfolio = {
            ...selectedPortfolio,
            subMarketors: selectedPortfolio.subMarketors.filter(s => s.id !== subId)
        };
        setPortfolios(prev => prev.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p));
        setSelectedPortfolio(updatedPortfolio);
      }
  };

  const getSubMarketorStats = (subId: string) => {
      let raised = 0;
      let investorsCount = 0;
      const associatedInvestments: any[] = [];

      investors.forEach(inv => {
          inv.investments.forEach(investment => {
              if (investment.subMarketorId === subId) {
                  raised += Number(investment.amount);
                  associatedInvestments.push({
                      investorName: `${inv.firstName} ${inv.lastName}`,
                      amount: investment.amount,
                      startDate: investment.startDate,
                      id: investment.id
                  });
              }
          });
      });
      const uniqueInvestors = new Set(associatedInvestments.map(i => i.investorName)).size;
      return { raised, investorsCount: uniqueInvestors, associatedInvestments };
  };

  const filteredPortfolios = portfolios.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewFile = (file: File | null | undefined) => {
      if (file) {
          const url = URL.createObjectURL(file);
          window.open(url, '_blank');
      }
  };

  // --- Table Columns ---

  const subMarketorColumns: Column<SubMarketor>[] = [
      {
          header: 'Name',
          render: (sub) => (
              <div>
                  <div className="font-bold text-navy-700 text-sm">{sub.name}</div>
                  <div className="text-[10px] text-gray-500">{sub.city}</div>
              </div>
          )
      },
      {
          header: 'Contact',
          render: (sub) => (
              <div className="text-sm text-gray-600">
                  <div className="text-xs">{sub.phone}</div>
                  <div className="text-[10px] text-gray-400">{sub.email}</div>
              </div>
          )
      },
      {
          header: 'Raised',
          render: (sub) => {
              const stats = getSubMarketorStats(sub.id);
              return <span className="text-sm font-bold text-navy-700">{formatCurrency(stats.raised.toString())}</span>;
          }
      },
      {
          header: 'Investors',
          render: (sub) => {
              const stats = getSubMarketorStats(sub.id);
              return <span className="text-sm text-gray-600">{stats.investorsCount}</span>;
          }
      },
      {
          header: <div className="text-right">Actions</div>,
          className: "text-right",
          render: (sub) => (
              <div className="flex items-center justify-end gap-2">
                  <button 
                      onClick={() => selectedPortfolio && setSelectedSubMarketor({ sub, parent: selectedPortfolio })}
                      className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 transition"
                  >
                      Dashboard
                  </button>
                  <button 
                      onClick={() => removeSubMarketor(sub.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Remove"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
              </div>
          )
      }
  ];

  const associatedInvestmentColumns: Column<any>[] = [
      {
          header: 'Investor Name',
          render: (item) => <span className="text-sm font-medium text-navy-700">{item.investorName}</span>
      },
      {
          header: 'Sub-Marketer',
          render: (item) => {
              const subName = item.subMarketorId ? (selectedPortfolio?.subMarketors.find(s => s.id === item.subMarketorId)?.name || 'Unknown') : 'Direct';
              return <span className="text-xs text-gray-600">{subName}</span>;
          }
      },
      {
          header: 'Invested Amount',
          render: (item) => <span className="text-sm font-bold text-green-600">{formatCurrency(item.amount)}</span>
      }
  ];

  const subMarketorInvestmentColumns: Column<any>[] = [
      {
          header: 'Investor Name',
          render: (item) => <span className="text-sm font-medium text-navy-700">{item.investorName}</span>
      },
      {
          header: 'Start Date',
          render: (item) => <span className="text-xs text-gray-600">{item.startDate}</span>
      },
      {
          header: 'Invested Amount',
          render: (item) => <span className="text-sm font-bold text-green-600">{formatCurrency(item.amount)}</span>
      }
  ];

  const mainPortfolioColumns: Column<Portfolio>[] = [
      {
          header: 'ID',
          accessorKey: 'id',
          className: 'text-sm text-gray-600'
      },
      {
          header: 'Marketer Name',
          render: (item) => (
              <div className="flex items-center">
                  <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {item.logo ? (
                          typeof item.logo === 'string' ? (
                              <img src={item.logo} alt="logo" className="h-full w-full rounded-full object-cover"/>
                          ) : (
                              <img src={URL.createObjectURL(item.logo)} alt="logo" className="h-full w-full rounded-full object-cover"/>
                          )
                      ) : (
                          item.name.substring(0,2).toUpperCase()
                      )}
                  </div>
                  <span className="ml-3 text-sm font-bold text-navy-700">{item.name}</span>
              </div>
          )
      },
      {
          header: 'Email',
          accessorKey: 'email',
          className: 'text-sm text-gray-600'
      },
      {
          header: 'Phone',
          accessorKey: 'phone',
          className: 'text-sm text-gray-600'
      },
      {
          header: 'Sub-Marketers',
          render: (item) => <span className="text-sm text-gray-600 font-bold">{item.subMarketors?.length || 0}</span>
      },
      {
          header: 'Total Raised',
          render: (item) => <span className="text-sm text-navy-700 font-medium">₹{item.totalRaised}</span>
      },
      {
          header: <div className="text-right">Actions</div>,
          className: "text-right",
          render: (item) => (
              <div className="flex items-center justify-end gap-2">
                  <button 
                      onClick={() => setSelectedPortfolio(item)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-transform hover:scale-105"
                      title="View Dashboard"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button 
                      onClick={() => handleEdit(item)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-md transition-transform hover:scale-105"
                      title="Edit"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
              </div>
          )
      }
  ];

  // --- Render Sub-Marketer Dashboard ---
  const renderSubMarketorDashboard = (sub: SubMarketor, parent: Portfolio) => {
      const { raised, investorsCount, associatedInvestments } = getSubMarketorStats(sub.id);

      return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => setSelectedSubMarketor(null)} 
                    className="flex items-center text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to {parent.name}
                </button>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => handleEditSubMarketor(sub)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit Details
                    </button>
                </div>
            </div>

             {/* Stats & Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
                 {/* Stats Section (70%) */}
                 <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ... (Stats Cards) ... */}
                    <Card>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Raised</p>
                                <h3 className="text-2xl font-bold text-navy-700">{formatCurrency(raised.toString())}</h3>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                    </Card>
                    <Card>
                         <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Investors</p>
                                <h3 className="text-2xl font-bold text-navy-700">{investorsCount}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                        </div>
                    </Card>
                 </div>

                 {/* Profile Card (30%) */}
                 <div className="lg:col-span-3">
                     <Card>
                        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                             <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                                {sub.name ? sub.name.substring(0,2).toUpperCase() : '??'}
                            </div>
                            <h3 className="text-xl font-bold text-navy-700 text-center">{sub.name}</h3>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Sub-Marketer</p>
                            <span className="text-sm text-gray-500 mt-1">{sub.city || 'Location N/A'}</span>
                        </div>
                        <div className="pt-6 space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Contact</p>
                                <p className="text-sm font-medium text-gray-700 mt-1 flex items-center gap-2">
                                     <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    {sub.phone}
                                </p>
                                <p className="text-sm font-medium text-gray-700 mt-1 flex items-center gap-2">
                                     <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    {sub.email}
                                </p>
                            </div>
                            {(Array.isArray(sub.bankAccounts) && sub.bankAccounts.length > 0) ? (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Primary Bank</p>
                                    <p className="text-sm font-medium text-gray-700 mt-1">{sub.bankAccounts[0].bankName || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">Acct: {sub.bankAccounts[0].accountNumber || 'N/A'}</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mt-1">No bank information available</p>
                                </div>
                            )}
                        </div>
                     </Card>
                 </div>
            </div>

            {/* Investments List */}
            <Card title="Investments Brought In">
                 <Table<any> 
                    columns={subMarketorInvestmentColumns}
                    data={associatedInvestments}
                    rowsPerPage={10}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No investments found."
                 />
            </Card>
        </div>
      );
  };

  // --- Render Portfolio (Marketer) Dashboard ---
  const renderPortfolioDashboard = (portfolio: Portfolio) => {
      // Calculate real stats from investors list by iterating over all investments
      let totalRaisedReal = 0;
      let associatedInvestorsCount = 0;
      const associatedInvestments: any[] = [];

      investors.forEach(inv => {
          let hasPortfolioInvestment = false;
          inv.investments.forEach(investment => {
              if (investment.portfolioId === portfolio.id) {
                  totalRaisedReal += Number(investment.amount);
                  hasPortfolioInvestment = true;
                  associatedInvestments.push({
                      investorName: `${inv.firstName} ${inv.lastName}`,
                      subMarketorId: investment.subMarketorId,
                      amount: investment.amount,
                      id: investment.id
                  });
              }
          });
          if (hasPortfolioInvestment) associatedInvestorsCount++;
      });

      return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => setSelectedPortfolio(null)} 
                    className="flex items-center text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to List
                </button>
            </div>

            {/* Layout: Stats (70%) | Profile (30%) */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
                
                {/* Stats Section (70% width on large screens) */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
                     <Card>
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Total Raised</p>
                            <h3 className="text-2xl font-bold text-navy-700">{formatCurrency(totalRaisedReal.toString())}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             </div>
                             <span className="text-xs text-gray-400">Lifetime</span>
                        </div>
                     </Card>
                     <Card>
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Total Investors</p>
                            <h3 className="text-2xl font-bold text-navy-700">{associatedInvestorsCount}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                             </div>
                             <span className="text-xs text-gray-400">Direct & Indirect</span>
                        </div>
                     </Card>
                     <Card>
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Active Sub-Marketers</p>
                            <h3 className="text-2xl font-bold text-navy-700">{portfolio.subMarketors?.length || 0}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                             </div>
                        </div>
                     </Card>
                </div>

                {/* Profile Card (30% width) */}
                 <div className="lg:col-span-3">
                     <Card>
                        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                             <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-lg">
                                {portfolio.logo ? (
                                    (typeof portfolio.logo === 'string') ? (
                                        <img src={portfolio.logo} alt="logo" className="h-full w-full rounded-full object-cover"/>
                                    ) : (
                                        <img src={URL.createObjectURL(portfolio.logo)} alt="logo" className="h-full w-full rounded-full object-cover"/>
                                    )
                                ) : (
                                    portfolio.name.substring(0,2).toUpperCase()
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-navy-700 text-center">{portfolio.name}</h3>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Marketer</p>
                            <span className="text-sm text-gray-500 mt-1">{portfolio.city || 'Location N/A'}</span>
                        </div>
                        <div className="pt-6 space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Contact</p>
                                <p className="text-sm font-medium text-gray-700 mt-1 flex items-center gap-2">
                                     <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    {portfolio.phone}
                                </p>
                                <p className="text-sm font-medium text-gray-700 mt-1 flex items-center gap-2">
                                     <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    {portfolio.email}
                                </p>
                            </div>
                             <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Identity</p>
                                <p className="text-sm font-medium text-gray-700 mt-1">PAN: {portfolio.pan || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-3">
                             <button
                                 onClick={() => handleEdit(portfolio)}
                                 className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md"
                             >
                                 View Full Details
                             </button>
                             <button 
                                onClick={() => {
                                    setSubFormData(INITIAL_SUB_MARKETOR_STATE);
                                    setIsEditingSub(false);
                                    setShowSubForm(true);
                                }}
                                className="w-full rounded-xl bg-indigo-50 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100 transition-all shadow-sm border border-indigo-200"
                             >
                                 + Add Sub-Marketer
                             </button>
                        </div>
                     </Card>
                 </div>
            </div>

            {/* Sub-Marketers Table */}
            <Card title="Sub-Marketers & Channel Partners">
                <Table<SubMarketor>
                    columns={subMarketorColumns}
                    data={portfolio.subMarketors}
                    keyExtractor={(row) => row.id}
                    emptyMessage="No sub-marketers found"
                    rowsPerPage={5}
                />
            </Card>

            {/* Associated Investors Table (Indirectly via Sub-Marketers or Direct) */}
            <Card title="All Associated Investors">
                 <Table<any> 
                    columns={associatedInvestmentColumns}
                    data={associatedInvestments}
                    rowsPerPage={10}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No investors found."
                 />
            </Card>
        </div>
      );
  };

  // --- Main Render ---
  
  if (selectedSubMarketor) {
      return renderSubMarketorDashboard(selectedSubMarketor.sub, selectedSubMarketor.parent);
  }

  if (selectedPortfolio) {
      return (
          <>
             {renderPortfolioDashboard(selectedPortfolio)}
             
             {/* Sub-Marketer Form Modal */}
             {showSubForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-fade-in-up">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="text-xl font-bold text-navy-700">{isEditingSub ? 'Edit Sub-Marketer' : 'Add New Sub-Marketer'}</h3>
                             <button onClick={() => setShowSubForm(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                        </div>
                        <form onSubmit={handleSaveSubMarketor}>
                            <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Basic Details</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Name *</label><input name="name" value={subFormData.name} onChange={handleSubInputChange} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Email *</label><input name="email" value={subFormData.email} onChange={handleSubInputChange} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Phone *</label><input name="phone" value={subFormData.phone} onChange={handleSubInputChange} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Commission Rate (%)</label><input name="commissionRate" type="number" step="0.01" value={subFormData.commissionRate} onChange={handleSubInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">PAN</label><input name="pan" value={subFormData.pan} onChange={handleSubInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Aadhar</label><input name="aadhar" value={subFormData.aadhar} onChange={handleSubInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                            </div>

                            <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Address Details</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">Address</label><input name="address" value={subFormData.address} onChange={handleSubInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">City</label><input name="city" value={subFormData.city} onChange={handleSubInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">State</label><input name="state" value={subFormData.state} onChange={handleSubInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Pincode</label><input name="pincode" value={subFormData.pincode} onChange={handleSubInputChange} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                            </div>
                            
                            <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1 flex justify-between">
                                Bank Details 
                                <button type="button" onClick={addSubBank} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100">+ Add Bank</button>
                            </h5>
                            {subFormData.bankAccounts.map((bank, index) => (
                                <div key={bank.id} className="bg-gray-50 p-3 rounded-lg mb-3 relative border border-gray-200">
                                    {subFormData.bankAccounts.length > 1 && <button type="button" onClick={() => removeSubBank(index)} className="absolute top-2 right-2 text-red-400">x</button>}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div><label className="text-[10px] font-bold text-gray-500">IFSC</label><input value={bank.ifsc} onChange={(e) => handleSubBankChange(index, 'ifsc', e.target.value)} onBlur={() => handleSubBankIfscBlur(index)} className="w-full rounded border px-2 py-1 text-xs" /></div>
                                        <div><label className="text-[10px] font-bold text-gray-500">Bank Name</label><input value={bank.bankName} onChange={(e) => handleSubBankChange(index, 'bankName', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" /></div>
                                        <div><label className="text-[10px] font-bold text-gray-500">Account No</label><input value={bank.accountNumber} onChange={(e) => handleSubBankChange(index, 'accountNumber', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" /></div>
                                        <div><label className="text-[10px] font-bold text-gray-500">Holder Name</label><input value={bank.accountHolderName} onChange={(e) => handleSubBankChange(index, 'accountHolderName', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" /></div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowSubForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Sub-Marketer</button>
                            </div>
                        </form>
                    </div>
                </div>
             )}
          </>
      );
  }

  return (
    <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex items-center">
                <div className="rounded-full bg-pink-50 text-pink-500 p-3 mr-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">Total Marketers</p>
                    <h4 className="text-2xl font-bold text-navy-700">{portfolios.length}</h4>
                </div>
            </Card>
            <Card className="flex items-center">
                <div className="rounded-full bg-indigo-50 text-indigo-600 p-3 mr-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">Sub-Marketers</p>
                    <h4 className="text-2xl font-bold text-navy-700">{portfolios.reduce((acc, p) => acc + (p.subMarketors?.length || 0), 0)}</h4>
                </div>
            </Card>
            <Card className="flex items-center">
                <div className="rounded-full bg-green-50 text-green-600 p-3 mr-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">Total Raised</p>
                    <h4 className="text-2xl font-bold text-navy-700">
                        {(() => {
                            const total = investors.reduce((acc, curr) => acc + curr.investments.reduce((sum, inv) => sum + (inv.portfolioId ? Number(inv.amount) : 0), 0), 0);
                            return total >= 10000000 ? `₹${(total/10000000).toFixed(2)} Cr` : `₹${(total/100000).toFixed(2)} L`;
                        })()}
                    </h4>
                </div>
            </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <button 
                onClick={() => { setIsEditing(false); setFormData(INITIAL_FORM_STATE); setShowForm(!showForm); }}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition duration-200 hover:bg-indigo-700 active:bg-indigo-800"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                {showForm ? 'Close Form' : 'Add Marketer'}
            </button>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search marketers..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64" 
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
        </div>

        {/* Add/Edit Marketer Form */}
        {showForm && (
            <Card title={isEditing ? "Edit Marketer" : "Add New Marketer"} className="animate-fade-in-down">
                <form onSubmit={handleSubmit}>
                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Basic Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Marketer Name *</label><input name="name" value={formData.name} onChange={handleInputChange} required className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email *</label><input name="email" value={formData.email} onChange={handleInputChange} required className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label><input name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">PAN</label><input name="pan" value={formData.pan} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Aadhar</label><input name="aadhar" value={formData.aadhar} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Default Commission Rate (%)</label><input name="defaultCommissionRate" type="number" step="0.01" value={formData.defaultCommissionRate} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-2">Description</label><input name="description" value={formData.description} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="Brief description about the marketer" /></div>
                    </div>

                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Address Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-2">Address</label><input name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">City</label><input name="city" value={formData.city} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">State</label><input name="state" value={formData.state} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label><input name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                    </div>

                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Documents</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Logo/Photo</label>
                             <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        </div>
                    </div>

                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1 flex justify-between">
                        Bank Details (For Payouts)
                        <button type="button" onClick={addPortfolioBank} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">+ Add Bank</button>
                    </h5>
                    {formData.bankAccounts.map((bank, index) => (
                        <div key={bank.id} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 relative">
                             {formData.bankAccounts.length > 1 && <button type="button" onClick={() => removePortfolioBank(index)} className="absolute top-2 right-2 text-red-400">x</button>}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">IFSC *</label><input value={bank.ifsc} onChange={(e) => handleBankChange(index, 'ifsc', e.target.value)} onBlur={() => handlePortfolioBankIfscBlur(index)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Bank Name *</label><input value={bank.bankName} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Account No *</label><input value={bank.accountNumber} onChange={(e) => handleBankChange(index, 'accountNumber', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Holder Name *</label><input value={bank.accountHolderName} onChange={(e) => handleBankChange(index, 'accountHolderName', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                             </div>
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={handleCancel} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium">Save Marketer</button>
                    </div>
                </form>
            </Card>
        )}

        <Card title="Marketers & Portfolios">
            <Table<Portfolio>
                columns={mainPortfolioColumns}
                data={filteredPortfolios}
                keyExtractor={(row) => row.id}
                emptyMessage="No marketers found"
            />
        </Card>
    </div>
  );
};

export default Portfolios;
