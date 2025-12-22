import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table, { Column } from '../components/Table';
import { SubMarketor, BankAccount, Portfolio, Investor } from '../types';
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

const INITIAL_FORM_STATE: SubMarketor = {
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
    photoFile: null,
    commissionRate: 0,
    bankAccounts: [{ ...INITIAL_BANK_STATE, id: 'sub_bank_init' }]
};

const SubMarketors: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SubMarketor>(INITIAL_FORM_STATE);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortfolioFilter, setSelectedPortfolioFilter] = useState<string>('all');

  // Selected sub-marketor for dashboard view
  const [selectedSubMarketor, setSelectedSubMarketor] = useState<{ sub: SubMarketor; parent: Portfolio } | null>(null);

  const formatCurrency = (amount: string | number) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount));
  };

  // Fetch portfolios & investors from backend
  useEffect(() => {
      const fetchData = async () => {
          try {
              const [p, i] = await Promise.all([portfoliosAPI.getAll(), investorsAPI.getAll()]);
              setPortfolios(p || []);
              setInvestors(i || []);
          } catch (err) {
              console.error('Failed to fetch data', err);
          }
      };
      fetchData();
  }, []);

  // Get all sub-marketors from all portfolios
  const allSubMarketors = portfolios.flatMap(portfolio =>
    (portfolio.subMarketors || []).map(sub => ({ sub, parent: portfolio }))
  );

  // Filter sub-marketors
  const filteredSubMarketors = allSubMarketors.filter(({ sub, parent }) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPortfolio = selectedPortfolioFilter === 'all' || String(parent.id) === String(selectedPortfolioFilter);
    return matchesSearch && matchesPortfolio;
  });

  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (index: number, field: keyof BankAccount, value: string) => {
    const updatedBanks = [...formData.bankAccounts];
    updatedBanks[index] = { ...updatedBanks[index], [field]: value };
    setFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
  };

  const handleBankIfscBlur = async (index: number) => {
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
        bankAccounts: [...prev.bankAccounts, { ...INITIAL_BANK_STATE, id: Math.random().toString(36).substr(2, 9) }]
    }));
  };

  const removeBank = (index: number) => {
    setFormData(prev => ({
        ...prev,
        bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setFormData(prev => ({ ...prev, photoFile: file }));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.portfolioId) {
      alert('Please select a portfolio/marketer');
      return;
    }

    try {
        const payload = {
            name: formData.name,
            email: formData.email || '',
            mobile: formData.phone || '',
            pan: formData.pan || '',
            aadhar: formData.aadhar || '',
            address: formData.address || '',
            city: formData.city || '',
            state: formData.state || '',
            pincode: formData.pincode || '',
            photoFile: formData.photoFile || null,
            commissionRate: formData.commissionRate || 0,
            bankAccounts: formData.bankAccounts.map(bank => ({
                ifsc: bank.ifsc || '',
                bankName: bank.bankName || '',
                branch: bank.branch || '',
                accountHolderName: bank.accountHolderName || '',
                accountNumber: bank.accountNumber || '',
                passbookFile: null
            }))
        };

        if (isEditing) {
            await portfoliosAPI.updateSubMarketor(String(formData.portfolioId), String(formData.id), payload);
            alert('Sub-marketer updated successfully');
        } else {
            await portfoliosAPI.addSubMarketor(String(formData.portfolioId), payload);
            alert('Sub-marketer created successfully');
        }

        // Refetch data
        const fresh = await portfoliosAPI.getAll();
        setPortfolios(fresh || []);
        handleCancel();
    } catch (err: any) {
        console.error('Failed to save sub-marketer', err);
        alert(err?.message || 'Failed to save sub-marketer');
    }
  };

  const handleEdit = (sub: SubMarketor, parent: Portfolio) => {
      const safeSub = {
          ...sub,
          portfolioId: parent.id,
          bankAccounts: (sub.bankAccounts && sub.bankAccounts.length > 0)
            ? sub.bankAccounts
            : [{ ...INITIAL_BANK_STATE, id: `sub_bank_${sub.id}` }]
      };
      setFormData(safeSub);
      setIsEditing(true);
      setShowForm(true);
      setSelectedSubMarketor(null);
  };

  const handleDelete = async (sub: SubMarketor, parent: Portfolio) => {
      if (!window.confirm(`Are you sure you want to delete ${sub.name}?`)) return;

      try {
          await portfoliosAPI.deleteSubMarketor(String(parent.id), String(sub.id));
          const fresh = await portfoliosAPI.getAll();
          setPortfolios(fresh || []);
          alert('Sub-marketer deleted successfully');
      } catch (err: any) {
          console.error('Failed to delete sub-marketer', err);
          alert(err?.message || 'Failed to delete sub-marketer');
      }
  };

  const handleCancel = () => {
      setShowForm(false);
      setIsEditing(false);
      setFormData(INITIAL_FORM_STATE);
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

  // Table columns
  const subMarketorColumns: Column<typeof filteredSubMarketors[0]>[] = [
      {
          header: 'Photo',
          render: ({ sub }) => (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                   {sub.photoFile ? (
                           typeof sub.photoFile === 'string' && sub.photoFile.startsWith('/uploads') ? (
                               <img src={`http://localhost:5000${sub.photoFile}`} alt={sub.name} className="h-full w-full object-cover"/>
                           ) : typeof sub.photoFile === 'object' && sub.photoFile instanceof File ? (
                               <img src={URL.createObjectURL(sub.photoFile)} alt={sub.name} className="h-full w-full object-cover"/>
                           ) : (
                               sub.name.substring(0,2).toUpperCase()
                           )
                       ) : (
                           sub.name.substring(0,2).toUpperCase()
                       )}
              </div>
          )
      },
      {
          header: 'Name',
          render: ({ sub }) => (
              <div>
                  <div className="font-bold text-navy-700 text-sm">{sub.name}</div>
                  <div className="text-[10px] text-gray-500">{sub.city || 'N/A'}</div>
              </div>
          )
      },
      {
          header: 'Portfolio/Marketer',
          render: ({ parent }) => (
              <span className="text-sm text-gray-600 font-medium">{parent.name}</span>
          )
      },
      {
          header: 'Contact',
          render: ({ sub }) => (
              <div className="text-sm text-gray-600">
                  <div className="text-xs">{sub.phone}</div>
                  <div className="text-[10px] text-gray-400">{sub.email}</div>
              </div>
          )
      },
      {
          header: 'Commission',
          render: ({ sub }) => (
              <span className="text-sm font-bold text-indigo-600">{sub.commissionRate}%</span>
          )
      },
      {
          header: 'Raised',
          render: ({ sub }) => {
              const stats = getSubMarketorStats(sub.id);
              return <span className="text-sm font-bold text-green-600">{formatCurrency(stats.raised)}</span>;
          }
      },
      {
          header: 'Investors',
          render: ({ sub }) => {
              const stats = getSubMarketorStats(sub.id);
              return <span className="text-sm text-gray-600">{stats.investorsCount}</span>;
          }
      },
      {
          header: <div className="text-right">Actions</div>,
          className: "text-right",
          render: (item) => (
              <div className="flex items-center justify-end gap-2">
                  <button
                      onClick={() => setSelectedSubMarketor(item)}
                      className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 transition"
                      title="View Dashboard"
                  >
                      View
                  </button>
                  <button
                      onClick={() => handleEdit(item.sub, item.parent)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-transform hover:scale-105"
                      title="Edit"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button
                      onClick={() => handleDelete(item.sub, item.parent)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white transition-transform hover:scale-105"
                      title="Delete"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
              </div>
          )
      }
  ];

  // Sub-Marketor Dashboard View
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
                    Back to List
                </button>
                <div className="flex gap-2">
                   <button
                       onClick={() => handleEdit(sub, parent)}
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
                   <Card>
                       <div className="flex items-start justify-between">
                           <div>
                               <p className="text-gray-500 text-sm font-medium mb-1">Total Raised</p>
                               <h3 className="text-2xl font-bold text-navy-700">{formatCurrency(raised)}</h3>
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
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg overflow-hidden">
                               {sub.photoFile ? (
                                   typeof sub.photoFile === 'string' && sub.photoFile.startsWith('/uploads') ? (
                                       <img src={`http://localhost:5000${sub.photoFile}`} alt={sub.name} className="h-full w-full object-cover"/>
                                   ) : sub.photoFile instanceof File ? (
                                       <img src={URL.createObjectURL(sub.photoFile)} alt={sub.name} className="h-full w-full object-cover"/>
                                   ) : (
                                       sub.name.substring(0,2).toUpperCase()
                                   )
                               ) : (
                                   sub.name.substring(0,2).toUpperCase()
                               )}
                           </div>
                           <h3 className="text-xl font-bold text-navy-700 text-center">{sub.name}</h3>
                           <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Sub-Marketer</p>
                           <span className="text-sm text-gray-500 mt-1">{sub.city || 'Location N/A'}</span>
                           <span className="text-xs text-indigo-600 font-bold mt-2">Under: {parent.name}</span>
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
                           <div>
                               <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Commission Rate</p>
                               <p className="text-lg font-bold text-indigo-600 mt-1">{sub.commissionRate}%</p>
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
                   columns={[
                       {
                           header: 'Investment ID',
                           render: (item) => <span className="text-xs text-gray-500 font-mono">#{item.id}</span>
                       },
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
                   ]}
                   data={associatedInvestments}
                   rowsPerPage={10}
                   keyExtractor={(item) => item.id}
                   emptyMessage="No investments found."
                />
           </Card>
       </div>
      );
  };

  // If viewing a specific sub-marketor dashboard
  if (selectedSubMarketor) {
      return renderSubMarketorDashboard(selectedSubMarketor.sub, selectedSubMarketor.parent);
  }

  // Main list view
  return (
    <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex items-center">
                <div className="rounded-full bg-green-50 text-green-500 p-3 mr-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">Total Sub-Marketers</p>
                    <h4 className="text-2xl font-bold text-navy-700">{allSubMarketors.length}</h4>
                </div>
            </Card>
            <Card className="flex items-center">
                <div className="rounded-full bg-indigo-50 text-indigo-600 p-3 mr-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">Portfolios</p>
                    <h4 className="text-2xl font-bold text-navy-700">{portfolios.length}</h4>
                </div>
            </Card>
            <Card className="flex items-center">
                <div className="rounded-full bg-blue-50 text-blue-600 p-3 mr-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">Active Investors</p>
                    <h4 className="text-2xl font-bold text-navy-700">{investors.length}</h4>
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
                {showForm ? 'Close Form' : 'Add Sub-Marketer'}
            </button>
            <div className="flex gap-4">
                <select
                    value={selectedPortfolioFilter}
                    onChange={(e) => setSelectedPortfolioFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All Portfolios</option>
                    {portfolios.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search sub-marketers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
            </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
            <Card title={isEditing ? "Edit Sub-Marketer" : "Add New Sub-Marketer"} className="animate-fade-in-down">
                <form onSubmit={handleSubmit}>
                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Basic Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio/Marketer *</label>
                            <select name="portfolioId" value={formData.portfolioId || ''} onChange={handleInputChange} required className="w-full rounded-xl border border-gray-200 px-4 py-3">
                                <option value="">Select Portfolio</option>
                                {portfolios.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Name *</label><input name="name" value={formData.name} onChange={handleInputChange} required className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label><input name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">PAN</label><input name="pan" value={formData.pan} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Aadhar</label><input name="aadhar" value={formData.aadhar} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label><input name="commissionRate" type="number" step="0.01" value={formData.commissionRate} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                    </div>

                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Address Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-2">Address</label><input name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">City</label><input name="city" value={formData.city} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">State</label><input name="state" value={formData.state} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label><input name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3" /></div>
                    </div>

                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1">Profile Photo</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                             <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                             {formData.photoFile && (
                                 <img
                                     src={typeof formData.photoFile === 'object' && formData.photoFile instanceof File
                                         ? URL.createObjectURL(formData.photoFile)
                                         : (typeof formData.photoFile === 'string' && formData.photoFile.startsWith('/uploads')
                                             ? `http://localhost:5000${formData.photoFile}`
                                             : formData.photoFile as string)}
                                     alt="Preview"
                                     className="mt-2 h-16 w-16 rounded-full object-cover"
                                 />
                             )}
                        </div>
                    </div>

                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-1 flex justify-between">
                        Bank Details
                        <button type="button" onClick={addBank} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">+ Add Bank</button>
                    </h5>
                    {formData.bankAccounts.map((bank, index) => (
                        <div key={bank.id} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 relative">
                             {formData.bankAccounts.length > 1 && <button type="button" onClick={() => removeBank(index)} className="absolute top-2 right-2 text-red-400">x</button>}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">IFSC *</label><input value={bank.ifsc} onChange={(e) => handleBankChange(index, 'ifsc', e.target.value)} onBlur={() => handleBankIfscBlur(index)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Bank Name *</label><input value={bank.bankName} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Account No *</label><input value={bank.accountNumber} onChange={(e) => handleBankChange(index, 'accountNumber', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 mb-1">Holder Name *</label><input value={bank.accountHolderName} onChange={(e) => handleBankChange(index, 'accountHolderName', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" /></div>
                             </div>
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={handleCancel} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium">Save Sub-Marketer</button>
                    </div>
                </form>
            </Card>
        )}

        {/* Sub-Marketers Table */}
        <Card title="All Sub-Marketers">
            <Table
                columns={subMarketorColumns}
                data={filteredSubMarketors}
                keyExtractor={(row) => `${row.parent.id}-${row.sub.id}`}
                emptyMessage="No sub-marketers found"
                rowsPerPage={15}
            />
        </Card>
    </div>
  );
};

export default SubMarketors;
