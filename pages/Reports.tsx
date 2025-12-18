import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import Table, { Column } from '../components/Table';
import { INITIAL_INVESTORS, INITIAL_PORTFOLIOS } from '../constants';

type ReportTab = 'OVERALL' | 'INVESTMENT_PAYOUT' | 'MARKETER';

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportTab>('OVERALL');

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    // --- Data Aggregation for Reports ---

    const investmentReportData = useMemo(() => {
        const rows: any[] = [];
        INITIAL_INVESTORS.forEach(inv => {
            inv.investments.forEach(deal => {
                const amount = Number(deal.amount || 0);
                const rate = Number(deal.interestRate || 0);
                
                // Find Marketer Names
                const portfolio = INITIAL_PORTFOLIOS.find(p => p.id === deal.portfolioId);
                const marketerName = portfolio?.name || 'Direct';
                const subMarketer = portfolio?.subMarketors.find(s => s.id === deal.subMarketorId);
                const combinedMarketer = subMarketer ? `${marketerName} / ${subMarketer.name}` : marketerName;

                rows.push({
                    id: deal.id,
                    investorName: `${inv.firstName} ${inv.lastName}`,
                    amount: amount,
                    interestRate: rate,
                    monthlyPayout: (amount * (rate / 100)) / 12,
                    startDate: deal.startDate,
                    endDate: deal.endDate,
                    combinedMarketer: combinedMarketer
                });
            });
        });
        return rows;
    }, []);

    const marketerReportData = useMemo(() => {
        return INITIAL_PORTFOLIOS.map(p => {
            let totalRaised = 0;
            let totalCommissionMonthly = 0;
            
            INITIAL_INVESTORS.forEach(inv => {
                inv.investments.forEach(deal => {
                    if (deal.portfolioId === p.id) {
                         const amount = Number(deal.amount || 0);
                         const commRate = Number(deal.marketorCommission || 0);
                         totalRaised += amount;
                         totalCommissionMonthly += (amount * (commRate / 100)) / 12;
                    }
                });
            });

            return {
                id: p.id,
                name: p.name,
                totalRaised,
                totalCommissionMonthly, 
                avgCommPercent: totalRaised > 0 ? ((totalCommissionMonthly * 12) / totalRaised) * 100 : 0
            };
        });
    }, []);

    const summaryStats = useMemo(() => {
        const totalCapital = investmentReportData.reduce((s, r) => s + r.amount, 0);
        const monthlyInterestPayout = investmentReportData.reduce((s, r) => s + r.monthlyPayout, 0);
        const monthlyCommPayout = marketerReportData.reduce((s, r) => s + r.totalCommissionMonthly, 0);
        
        return {
            totalCapital,
            monthlyInterestPayout,
            monthlyCommPayout,
            totalMonthlyLiability: monthlyInterestPayout + monthlyCommPayout
        };
    }, [investmentReportData, marketerReportData]);

    // --- Render Functions ---

    return (
        <div className="space-y-6">
            <div className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm w-fit border border-gray-100">
                <button
                    onClick={() => setActiveTab('OVERALL')}
                    className={`rounded-lg px-6 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                        activeTab === 'OVERALL' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Overall Summary
                </button>
                <button
                    onClick={() => setActiveTab('INVESTMENT_PAYOUT')}
                    className={`rounded-lg px-6 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                        activeTab === 'INVESTMENT_PAYOUT' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Investment & Payouts
                </button>
                <button
                    onClick={() => setActiveTab('MARKETER')}
                    className={`rounded-lg px-6 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                        activeTab === 'MARKETER' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Marketer Performance
                </button>
            </div>

            {activeTab === 'OVERALL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                    <Card className="bg-navy-700 text-white">
                        <p className="text-navy-300 text-[10px] font-bold uppercase mb-1">Total Capital Under Management</p>
                        <h4 className="text-2xl font-bold">{formatCurrency(summaryStats.totalCapital)}</h4>
                    </Card>
                    <Card>
                        <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Monthly Interest Payout</p>
                        <h4 className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.monthlyInterestPayout)}</h4>
                    </Card>
                    <Card>
                        <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Monthly Marketer Commission</p>
                        <h4 className="text-2xl font-bold text-orange-600">{formatCurrency(summaryStats.monthlyCommPayout)}</h4>
                    </Card>
                    <Card className="bg-indigo-50">
                        <p className="text-indigo-400 text-[10px] font-bold uppercase mb-1">Total Monthly Liability</p>
                        <h4 className="text-2xl font-bold text-indigo-700">{formatCurrency(summaryStats.totalMonthlyLiability)}</h4>
                    </Card>
                </div>
            )}

            {activeTab === 'INVESTMENT_PAYOUT' && (
                <Card title="Investment & Payout Schedule" className="animate-fade-in-up">
                    <Table 
                        columns={[
                            { header: 'Investor', accessorKey: 'investorName', sortable: true, className: 'text-xs font-bold text-navy-700' },
                            { header: 'Marketer / Sub', accessorKey: 'combinedMarketer', sortable: true, className: 'text-[10px] text-gray-500 font-bold uppercase' },
                            { header: 'Amount', accessorKey: 'amount', render: (r) => <span className="text-xs font-bold text-navy-700">{formatCurrency(r.amount)}</span>, sortable: true },
                            { header: 'Rate', accessorKey: 'interestRate', render: (r) => <span className="text-xs font-bold text-blue-600">{r.interestRate}%</span>, sortable: true },
                            { header: 'Monthly Payout', accessorKey: 'monthlyPayout', render: (r) => <span className="text-xs font-bold text-green-600">{formatCurrency(r.monthlyPayout)}</span>, sortable: true },
                            { header: 'Tenure', render: (r) => <span className="text-[10px] text-gray-400">{r.startDate} to {r.endDate}</span> }
                        ]}
                        data={investmentReportData}
                        keyExtractor={(r) => r.id}
                        searchable={true}
                    />
                </Card>
            )}

            {activeTab === 'MARKETER' && (
                <Card title="Marketer Performance Report" className="animate-fade-in-up">
                    <Table 
                        columns={[
                            { header: 'Marketer Name', accessorKey: 'name', sortable: true, className: 'text-xs font-bold text-navy-700' },
                            { header: 'Total Capital Raised', accessorKey: 'totalRaised', render: (r) => <span className="text-xs font-bold text-navy-700">{formatCurrency(r.totalRaised)}</span>, sortable: true },
                            { header: 'Avg Comm %', accessorKey: 'avgCommPercent', render: (r) => <span className="text-xs font-bold text-indigo-600">{r.avgCommPercent.toFixed(2)}%</span>, sortable: true },
                            { header: 'Est. Monthly Comm', accessorKey: 'totalCommissionMonthly', render: (r) => <span className="text-xs font-bold text-orange-600">{formatCurrency(r.totalCommissionMonthly)}</span>, sortable: true }
                        ]}
                        data={marketerReportData}
                        keyExtractor={(r) => r.id}
                        searchable={true}
                    />
                </Card>
            )}
        </div>
    );
};

export default Reports;