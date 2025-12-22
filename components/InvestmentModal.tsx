import React, { useState } from 'react';
import { Investment, BankAccount, Portfolio } from '../types';

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    investment: Investment | null;
    onSave: (investment: Investment) => void;
    onDelete?: (investmentId: string) => void;
    investorBankAccounts: BankAccount[];
    adminBanks: BankAccount[];
    portfolios: Portfolio[];
    isEditing: boolean;
}

const INITIAL_INVESTMENT: Investment = {
    id: '',
    amount: '',
    startDate: '',
    endDate: '',
    interestRate: '',
    bankAccountId: '',
    senderBankId: '',
    payoutDate: '',
    portfolioId: '',
    subMarketorId: '',
    marketorCommission: '',
    subMarketorCommission: ''
};

const InvestmentModal: React.FC<InvestmentModalProps> = ({
    isOpen,
    onClose,
    investment,
    onSave,
    onDelete,
    investorBankAccounts,
    adminBanks,
    portfolios,
    isEditing
}) => {
    const [formData, setFormData] = useState<Investment>(
        investment || { ...INITIAL_INVESTMENT, id: Math.random().toString(36).substr(2, 9) }
    );

    React.useEffect(() => {
        if (investment) {
            setFormData(investment);
        } else {
            setFormData({ ...INITIAL_INVESTMENT, id: Math.random().toString(36).substr(2, 9) });
        }
    }, [investment, isOpen]);

    const handleChange = (field: keyof Investment, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Reset sub-marketor when portfolio changes
            if (field === 'portfolioId') {
                updated.subMarketorId = '';
                updated.subMarketorCommission = '';
            }

            return updated;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleDelete = () => {
        if (onDelete && formData.id && window.confirm('Are you sure you want to delete this investment?')) {
            onDelete(formData.id);
            onClose();
        }
    };

    const selectedPortfolio = formData.portfolioId
        ? portfolios.find(p => String(p.id) === String(formData.portfolioId))
        : null;

    const availableSubMarketors = selectedPortfolio?.subMarketors || [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                    <h3 className="text-xl font-bold text-navy-700">
                        {isEditing ? 'Edit Investment' : 'Add New Investment'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Investment Amount & Dates */}
                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-2">Investment Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Amount *</label>
                            <input
                                type="number"
                                placeholder="₹"
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                required
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Interest Rate (%) *</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="%"
                                value={formData.interestRate}
                                onChange={(e) => handleChange('interestRate', e.target.value)}
                                required
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Start Date *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                required
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">End Date *</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleChange('endDate', e.target.value)}
                                required
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Payout Date</label>
                            <select
                                value={formData.payoutDate || ''}
                                onChange={(e) => handleChange('payoutDate', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select Date</option>
                                <option value="10th">10th</option>
                                <option value="20th">20th</option>
                                <option value="30th">30th</option>
                            </select>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-2">Bank Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Sender Bank (Admin)</label>
                            <select
                                value={formData.senderBankId || ''}
                                onChange={(e) => handleChange('senderBankId', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select Sender Bank</option>
                                {adminBanks.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.bankName} - {b.accountNumber ? '****' + b.accountNumber.slice(-4) : '----'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Payout Bank (Investor)</label>
                            <select
                                value={formData.bankAccountId || ''}
                                onChange={(e) => handleChange('bankAccountId', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select Payout Bank</option>
                                {investorBankAccounts.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.bankName} - {b.accountNumber ? '****' + b.accountNumber.slice(-4) : '----'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Portfolio & Commission */}
                    <h5 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-2">Portfolio & Commission</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Marketer (Portfolio)</label>
                            <select
                                value={formData.portfolioId || ''}
                                onChange={(e) => handleChange('portfolioId', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                                <option value="">None (Direct)</option>
                                {portfolios.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Portfolio Commission (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="%"
                                value={formData.marketorCommission}
                                onChange={(e) => handleChange('marketorCommission', e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Sub-Marketer</label>
                            <select
                                value={formData.subMarketorId || ''}
                                onChange={(e) => handleChange('subMarketorId', e.target.value)}
                                disabled={!formData.portfolioId || availableSubMarketors.length === 0}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">None (Direct)</option>
                                {availableSubMarketors.map(sm => (
                                    <option key={sm.id} value={sm.id}>{sm.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Sub-Marketor Commission (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="%"
                                value={formData.subMarketorCommission}
                                onChange={(e) => handleChange('subMarketorCommission', e.target.value)}
                                disabled={!formData.subMarketorId}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        {isEditing && onDelete ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium"
                            >
                                Delete Investment
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md"
                            >
                                {isEditing ? 'Update Investment' : 'Add Investment'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvestmentModal;
