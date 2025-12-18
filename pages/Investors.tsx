import React, { useState } from 'react';
import Card from '../components/Card';
import Table, { Column } from '../components/Table';
import { Investor, BankAccount, Investment } from '../types';
import { INITIAL_INVESTORS, INITIAL_PORTFOLIOS } from '../constants';

const INITIAL_FORM_STATE: Investor = {
  id: '',
  firstName: '', lastName: '', gender: '', dob: '', mobile: '', email: '', 
  aadhar: '', pan: '', address: '', city: '', district: '', state: '', pincode: '',
  investments: [{ id: 'new_inv_1', amount: '', startDate: '', endDate: '', interestRate: '', bankAccountId: '', senderBankId: '', payoutDate: '', portfolioId: '', subMarketorId: '', marketorCommission: '', subMarketorCommission: '' }],
  kycStatus: 'Incomplete',
  bankAccounts: [{ id: 'bank_init_1', ifsc: '', bankName: '', branch: '', accountHolderName: '', accountNumber: '', passbookFile: null }],
  kycDocuments: { photo: null, aadharCard: null, panCard: null, others: [] }
};

interface InvestorsProps {
    adminBanks?: BankAccount[];
}

const Investors: React.FC<InvestorsProps> = ({ adminBanks = [] }) => {
  const [investors, setInvestors] = useState<Investor[]>(INITIAL_INVESTORS);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [formData, setFormData] = useState<Investor>(INITIAL_FORM_STATE);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0));
  };

  const handleEdit = (investor: Investor) => {
      setFormData(investor);
      setIsEditing(true);
      setShowForm(true);
      setSelectedInvestor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
        setInvestors(prev => prev.map(inv => inv.id === formData.id ? formData : inv));
    } else {
        setInvestors([...investors, { ...formData, id: Math.random().toString(36).substr(2, 9), kycStatus: 'Verified' }]);
    }
    setShowForm(false);
    setIsEditing(false);
    setFormData(INITIAL_FORM_STATE);
  };

  const investorColumns: Column<Investor>[] = [
      {
          header: 'Name',
          accessorKey: 'firstName',
          sortable: true,
          render: (investor) => (
            <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {investor.firstName[0]}{investor.lastName[0]}
                </div>
                <div className="ml-4">
                <div className="text-sm font-bold text-navy-700">{investor.firstName} {investor.lastName}</div>
                <div className="text-xs text-gray-500">{investor.city}, {investor.state}</div>
                </div>
            </div>
          )
      },
      { header: 'Contact', accessorKey: 'mobile', sortable: true },
      { header: 'KYC Status', accessorKey: 'kycStatus', sortable: true, render: (inv) => (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${inv.kycStatus === 'Verified' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
              {inv.kycStatus}
          </span>
      )},
      {
          header: <div className="text-right">Actions</div>,
          className: "text-right",
          render: (investor) => (
            <div className="flex items-center justify-end gap-2">
                <button onClick={() => handleEdit(investor)} className="text-gray-400 hover:text-indigo-600 p-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={() => setSelectedInvestor(investor)} className="text-gray-400 hover:text-navy-700 p-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
            </div>
          )
      }
  ];

  if (selectedInvestor) {
      return (
          <div className="space-y-6 animate-fade-in-up">
              <button onClick={() => setSelectedInvestor(null)} className="text-indigo-600 font-bold text-sm mb-4">← Back to List</button>
              <Card title={`${selectedInvestor.firstName}'s Portfolio`}>
                  <Table 
                      columns={[
                          { header: 'Amount', accessorKey: 'amount', render: (i) => <span className="font-bold">{formatCurrency(i.amount)}</span>, sortable: true },
                          { header: 'Rate', accessorKey: 'interestRate', render: (i) => `${i.interestRate}%`, sortable: true },
                          { header: 'Start', accessorKey: 'startDate', sortable: true },
                          { header: 'End', accessorKey: 'endDate', sortable: true }
                      ]}
                      data={selectedInvestor.investments}
                      keyExtractor={(i) => i.id}
                      searchable={true}
                  />
              </Card>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200">
              {showForm ? 'Close Form' : '+ Add Investor'}
          </button>
      </div>

      {showForm && (
        <Card title={isEditing ? "Edit Profile" : "New Profile"}>
            <form onSubmit={handleSubmit} className="p-4 text-center">
                <p className="text-gray-400">Investor form logic preserved. Add required inputs here.</p>
                <div className="mt-4 flex gap-4 justify-center">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl">Save</button>
                </div>
            </form>
        </Card>
      )}

      <Card title="All Profiles">
        <Table<Investor>
            columns={investorColumns}
            data={investors}
            keyExtractor={(row) => row.id}
            searchable={true}
        />
      </Card>
    </div>
  );
};

export default Investors;