import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import Table, { Column } from '../components/Table';
import { INITIAL_INVESTORS, INITIAL_PORTFOLIOS } from '../constants';

type ReportTab = 'OVERALL' | 'INVESTMENT_PAYOUT' | 'MARKETER';

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ReportTab>('OVERALL');

    // --- Helpers ---
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    // --- Data Aggregation ---

    // 1. Investment & Payout Data
    const investmentReportData = useMemo(() => {
        const rows: any[] = [];
        INITIAL_INVESTORS.forEach(inv => {
            inv.investments.forEach(deal => {
                const amount = Number(deal.amount || 0);
                const rate = Number(deal.interestRate || 0);
                const monthlyPayout = (amount * (rate / 100)) / 12;
                
                // Find Marketer & Sub-Marketer names
                const portfolio = INITIAL_PORTFOLIOS.find(p => p.id === deal.portfolioId);
                const portfolioName = portfolio?.name || 'Direct';
                
                let combinedMarketerName = portfolioName;
                if (deal.subMarketorId) {
                    const sub = portfolio?.subMarketors.find(s => s.id === deal.subMarketorId);
                    if (sub) {
                        combinedMarketerName = `${portfolioName} / ${sub.name}`;
                    }
                }
                
                rows.push({
                    id: deal.id,
                    investorName: `${inv.firstName} ${inv.lastName}`,
                    amount: amount,
                    interestRate: rate,
                    monthlyPayout: monthlyPayout,
                    startDate: deal.startDate,
                    endDate: deal.endDate,
                    combinedMarketerName: combinedMarketerName
                });
            });
        });
        return rows;
    }, []);

    // 2. Marketer Data
    const marketerReportData = useMemo(() => {
        return INITIAL_PORTFOLIOS.map(p => {
            let totalRaised = 0;
            let totalCommissionMonthly = 0;
            let activeDeals = 0;

            // Iterate through all investments to find matches for this portfolio
            INITIAL_INVESTORS.forEach(inv => {
                inv.investments.forEach(deal => {
                    if (deal.portfolioId === p.id) {
                         const amount = Number(deal.amount || 0);
                         const commRate = Number(deal.marketorCommission || 0);
                         
                         totalRaised += amount;
                         activeDeals += 1;
                         totalCommissionMonthly += (amount * (commRate / 100)) / 12;
                    }
                });
            });

            // Calculate Effective Average Commission %
            // (Total Annual Commission / Total Raised) * 100
            // Annual Comm = Monthly * 12
            const effectiveCommissionRate = totalRaised > 0 
                ? ((totalCommissionMonthly * 12) / totalRaised) * 100 
                : 0;

            return {
                id: p.id,
                name: p.name,
                totalRaised,
                totalCommissionMonthly, 
                effectiveCommissionRate,
                activeDeals,
                investorCount: p.investorCount
            };
        });
    }, []);

    // 3. Overall Stats
    const overallStats = useMemo(() => {
        const totalCapital = investmentReportData.reduce((sum, row) => sum + row.amount, 0);
        const monthlyInvestorLiability = investmentReportData.reduce((sum, row) => sum + row.monthlyPayout, 0);
        const monthlyMarketerLiability = marketerReportData.reduce((sum, row) => sum + row.totalCommissionMonthly, 0);
        const totalInvestors = INITIAL_INVESTORS.length;
        const totalActiveDeals = investmentReportData.length;

        return {
            totalCapital,
            monthlyInvestorLiability,
            monthlyMarketerLiability,
            totalMonthlyLiability: monthlyInvestorLiability + monthlyMarketerLiability,
            totalInvestors,
            totalActiveDeals
        };
    }, [investmentReportData, marketerReportData]);


    // --- Column Definitions ---

    const investmentColumns: Column<typeof investmentReportData[0]>[] = [
        { header: 'Investor', accessorKey: 'investorName', className: 'font-medium text-navy-700', sortable: true },
        { header: 'Marketer / Sub-Marketer', accessorKey: 'combinedMarketerName', className: 'text-gray-500 text-xs', sortable: true },
        { header: 'Amount', accessorKey: 'amount', render: (row) => <span className="font-bold text-navy-700">{formatCurrency(row.amount)}</span>, sortable: true },
        { header: 'Rate', accessorKey: 'interestRate', render: (row) => <span className="text-blue-600 font-bold">{row.interestRate}%</span>, sortable: true },
        { header: 'Monthly Payout', accessorKey: 'monthlyPayout', render: (row) => <span className="text-green-600 font-bold">{formatCurrency(row.monthlyPayout)}</span>, sortable: true },
        { header: 'Tenure', render: (row) => <span className="text-xs text-gray-500">{row.startDate} to {row.endDate}</span> }
    ];

    const marketerColumns: Column<typeof marketerReportData[0]>[] = [
        { header: 'Marketer Name', accessorKey: 'name', className: 'font-bold text-navy-700', sortable: true },
        { header: 'Active Deals', accessorKey: 'activeDeals', className: 'text-center', sortable: true },
        { header: 'Total Raised', accessorKey: 'totalRaised', render: (row) => <span className="text-navy-700 font-medium">{formatCurrency(row.totalRaised)}</span>, sortable: true },
        { header: 'Avg Comm %', accessorKey: 'effectiveCommissionRate', render: (row) => <span className="text-gray-600 font-bold">{row.effectiveCommissionRate.toFixed(2)}%</span>, sortable: true },
        { header: 'Est. Monthly Payout', accessorKey: 'totalCommissionMonthly', render: (row) => <span className="text-orange-600 font-bold">{formatCurrency(row.totalCommissionMonthly)}</span>, sortable: true }
    ];

    // --- Render Tabs ---

    const renderOverall = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-indigo-600 text-white">
                    <div className="text-indigo-100 text-sm font-medium mb-1">Total Capital Raised</div>
                    <div className="text-3xl font-bold">{formatCurrency(overallStats.totalCapital)}</div>
                    <div className="text-indigo-200 text-xs mt-2">Across {overallStats.totalInvestors} Investors</div>
                </Card>
                <Card className="bg-white">
                    <div className="text-gray-500 text-sm font-medium mb-1">Total Monthly Liability</div>
                    <div className="text-3xl font-bold text-red-600">{formatCurrency(overallStats.totalMonthlyLiability)}</div>
                    <div className="text-gray-400 text-xs mt-2">Investors + Marketers</div>
                </Card>
                <Card className="bg-white">
                    <div className="text-gray-500 text-sm font-medium mb-1">Investor Monthly Payouts</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(overallStats.monthlyInvestorLiability)}</div>
                    <div className="text-gray-400 text-xs mt-2">Interest Distributions</div>
                </Card>
                <Card className="bg-white">
                    <div className="text-gray-500 text-sm font-medium mb-1">Marketer Monthly Payouts</div>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(overallStats.monthlyMarketerLiability)}</div>
                    <div className="text-gray-400 text-xs mt-2">Commission Distributions</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card title="Business Health">
                     <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                             <span className="text-gray-600">Active Deals</span>
                             <span className="font-bold text-navy-700">{overallStats.totalActiveDeals}</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                             <span className="text-gray-600">Active Marketers</span>
                             <span className="font-bold text-navy-700">{INITIAL_PORTFOLIOS.length}</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                             <span className="text-gray-600">Avg. Deal Size</span>
                             <span className="font-bold text-navy-700">{formatCurrency(overallStats.totalActiveDeals > 0 ? overallStats.totalCapital / overallStats.totalActiveDeals : 0)}</span>
                         </div>
                     </div>
                 </Card>
                 <Card title="Projected Annual Outflow">
                     <div className="flex flex-col items-center justify-center h-full pb-4">
                         <div className="text-4xl font-bold text-navy-700 mb-2">{formatCurrency(overallStats.totalMonthlyLiability * 12)}</div>
                         <p className="text-gray-400 text-sm text-center">Estimated total payout (Interest + Commission) for the next 12 months based on current active deals.</p>
                     </div>
                 </Card>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab('OVERALL')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        activeTab === 'OVERALL' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    Overall Summary
                </button>
                <button
                    onClick={() => setActiveTab('INVESTMENT_PAYOUT')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        activeTab === 'INVESTMENT_PAYOUT' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    Investment & Payouts
                </button>
                <button
                    onClick={() => setActiveTab('MARKETER')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        activeTab === 'MARKETER' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    Marketer Performance
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'OVERALL' && renderOverall()}
            
            {activeTab === 'INVESTMENT_PAYOUT' && (
                <Card title="Investment & Payout Schedule" className="animate-fade-in-up">
                    <Table 
                        columns={investmentColumns}
                        data={investmentReportData}
                        keyExtractor={(row) => row.id}
                        rowsPerPage={15}
                        searchable={true}
                        searchPlaceholder="Search reports..."
                    />
                </Card>
            )}

            {activeTab === 'MARKETER' && (
                 <Card title="Marketer Performance Report" className="animate-fade-in-up">
                    <Table 
                        columns={marketerColumns}
                        data={marketerReportData}
                        keyExtractor={(row) => row.id}
                        rowsPerPage={10}
                        searchable={true}
                        searchPlaceholder="Search marketers..."
                    />
                </Card>
            )}
        </div>
    );
};

export default Reports;