import React, { useMemo } from 'react';
import Card from '../components/Card';
import Table, { Column } from '../components/Table';
import { INITIAL_INVESTORS, INITIAL_PORTFOLIOS } from '../constants';
import { Investor, Portfolio } from '../types';

const Dashboard: React.FC = () => {
  // --- Calculations ---
  
  // 1. Total Funds
  const totalFunds = INITIAL_INVESTORS.reduce((acc, curr) => {
    return acc + curr.investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  }, 0);

  // 2. Funds Raised Last 30 Days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const fundsLast30Days = INITIAL_INVESTORS.reduce((acc, curr) => {
    return acc + curr.investments.reduce((sum, inv) => {
      const invDate = new Date(inv.startDate);
      return invDate >= thirtyDaysAgo ? sum + Number(inv.amount || 0) : sum;
    }, 0);
  }, 0);

  // 3. Total Investors
  const totalInvestors = INITIAL_INVESTORS.length;

  // 4-7. December Payout Calculations (Monthly Estimate)
  // Assuming Interest Rate and Commissions are Annual % paid monthly
  let decPayoutInvestors = 0;
  let decPayoutPortfolios = 0;
  let decPayoutSubMarketers = 0;

  INITIAL_INVESTORS.forEach(inv => {
      inv.investments.forEach(deal => {
          const amount = Number(deal.amount || 0);
          
          // Investor Interest: (Principal * Rate%) / 12
          const interestRate = Number(deal.interestRate || 0);
          decPayoutInvestors += (amount * (interestRate / 100)) / 12;

          // Portfolio (Marketer) Commission
          const marketerComm = Number(deal.marketorCommission || 0);
          decPayoutPortfolios += (amount * (marketerComm / 100)) / 12;

          // Sub-Marketer Commission
          const subMarketerComm = Number(deal.subMarketorCommission || 0);
          decPayoutSubMarketers += (amount * (subMarketerComm / 100)) / 12;
      });
  });

  const decTotalPayout = decPayoutInvestors + decPayoutPortfolios + decPayoutSubMarketers;

  const formatCurrency = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const formatCurrencyCompact = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${(val/1000).toFixed(1)}k`;
  };

  // --- Portfolio Aggregation for Table ---
  const portfolioTableData = useMemo(() => {
      return INITIAL_PORTFOLIOS.map(p => {
          let pTotal = 0;
          let pInvestors = new Set();
          
          INITIAL_INVESTORS.forEach(inv => {
              inv.investments.forEach(deal => {
                  if (deal.portfolioId === p.id) {
                      pTotal += Number(deal.amount);
                      pInvestors.add(inv.id);
                  }
              });
          });

          return {
              id: p.id,
              name: p.name,
              totalInvestment: pTotal,
              investorCount: pInvestors.size
          };
      }).sort((a, b) => b.totalInvestment - a.totalInvestment);
  }, []);

  const portfolioColumns: Column<typeof portfolioTableData[0]>[] = [
      {
          header: 'Portfolio Name',
          render: (row) => <span className="font-bold text-navy-700 text-xs">{row.name}</span>
      },
      {
          header: 'Total Investment (INR)',
          render: (row) => <span className="text-green-600 font-bold text-xs">{formatCurrency(row.totalInvestment)}</span>
      },
      {
          header: 'Investors',
          accessorKey: 'investorCount',
          className: 'text-xs text-center'
      }
  ];

  // --- Custom Stock Chart Component ---
  const StockChart = () => {
      // Mock Data for Year/Month trend
      const dataPoints = [
          { month: 'Jan', invest: 120, payout: 10 },
          { month: 'Feb', invest: 150, payout: 12 },
          { month: 'Mar', invest: 180, payout: 15 },
          { month: 'Apr', invest: 170, payout: 18 },
          { month: 'May', invest: 210, payout: 22 },
          { month: 'Jun', invest: 250, payout: 25 },
          { month: 'Jul', invest: 290, payout: 28 },
          { month: 'Aug', invest: 280, payout: 32 },
          { month: 'Sep', invest: 320, payout: 35 },
          { month: 'Oct', invest: 350, payout: 38 },
          { month: 'Nov', invest: 380, payout: 42 },
          { month: 'Dec', invest: 420, payout: 45 },
      ];

      const maxVal = Math.max(...dataPoints.map(d => d.invest));
      const height = 200;
      const width = 100; // Percentage based
      
      // Generate SVG Paths
      const getPoints = (key: 'invest' | 'payout') => {
          return dataPoints.map((d, i) => {
              const x = (i / (dataPoints.length - 1)) * 100;
              const y = 100 - (d[key] / maxVal) * 80; // Leave some padding
              return `${x},${y}`;
          }).join(' ');
      };

      const investPoints = getPoints('invest');
      const payoutPoints = getPoints('payout');

      return (
          <div className="w-full h-64 relative mt-4 select-none">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#f3f4f6" strokeWidth="0.5" />
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#f3f4f6" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="100" y2="60" stroke="#f3f4f6" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="#f3f4f6" strokeWidth="0.5" />

                  {/* Areas */}
                  <defs>
                      <linearGradient id="investGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="payoutGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                  </defs>

                  {/* Investment Line & Area */}
                  <polygon points={`0,100 ${investPoints} 100,100`} fill="url(#investGradient)" />
                  <polyline points={investPoints} fill="none" stroke="#4f46e5" strokeWidth="1" vectorEffect="non-scaling-stroke" />

                  {/* Payout Line & Area */}
                  <polygon points={`0,100 ${payoutPoints} 100,100`} fill="url(#payoutGradient)" />
                  <polyline points={payoutPoints} fill="none" stroke="#10b981" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  
                  {/* Hover Dots (Simplified for pure CSS/SVG without JS interactivity libraries) */}
                  {dataPoints.map((d, i) => {
                      const x = (i / (dataPoints.length - 1)) * 100;
                      const yInvest = 100 - (d.invest / maxVal) * 80;
                      return (
                          <circle key={i} cx={x} cy={yInvest} r="1.5" fill="white" stroke="#4f46e5" strokeWidth="0.5" className="hover:r-2 transition-all cursor-pointer" />
                      )
                  })}
              </svg>
              
              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                  {dataPoints.map((d, i) => (
                      <span key={i}>{d.month}</span>
                  ))}
              </div>

              {/* Legend */}
              <div className="absolute top-0 right-0 flex gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1">
                      <div className="w-3 h-1 bg-indigo-600 rounded-full"></div>
                      <span className="text-gray-600">Investment</span>
                  </div>
                  <div className="flex items-center gap-1">
                      <div className="w-3 h-1 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Payout</span>
                  </div>
              </div>
          </div>
      );
  };

  // --- KPI Card Component ---
  const KpiCard = ({ title, value, colorClass, icon, subLabel }: any) => (
    <Card className="flex flex-col justify-center h-full relative overflow-hidden">
      <div className="flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">{title}</p>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">{value}</h4>
            {subLabel && <p className="text-[10px] text-gray-400 mt-1">{subLabel}</p>}
          </div>
          <div className={`rounded-full p-2.5 ${colorClass}`}>
            {icon}
          </div>
      </div>
      {/* Decorative background circle */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 ${colorClass.replace('text-', 'bg-')}`}></div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {/* Row 1: General Stats */}
        <KpiCard 
            title="Total Funds by Investors" 
            value={formatCurrency(totalFunds)} 
            colorClass="bg-indigo-50 text-indigo-600"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard 
            title="Funds Raised (30 Days)" 
            value={formatCurrency(fundsLast30Days)} 
            subLabel="Last 30 Days Activity"
            colorClass="bg-blue-50 text-blue-600"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KpiCard 
            title="Total Investors" 
            value={totalInvestors} 
            colorClass="bg-teal-50 text-teal-600"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <KpiCard 
            title="DEC Month Total Payout" 
            value={formatCurrencyCompact(decTotalPayout)} 
            subLabel="Combined Outflow"
            colorClass="bg-purple-50 text-purple-600"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
      </div>

      {/* Row 2: Breakdown Payouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard 
            title="DEC Month Payout to Investors" 
            value={formatCurrencyCompact(decPayoutInvestors)} 
            subLabel="Interest Distributions"
            colorClass="bg-green-50 text-green-600"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard 
            title="DEC Month Payout to Portfolios" 
            value={formatCurrencyCompact(decPayoutPortfolios)} 
            subLabel="Marketer Commissions"
            colorClass="bg-orange-50 text-orange-600"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <KpiCard 
            title="DEC Month Payout to Sub-Marketers" 
            value={formatCurrencyCompact(decPayoutSubMarketers)} 
            subLabel="Sub-Marketer Commissions"
            colorClass="bg-pink-50 text-pink-600"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
      </div>

      {/* 2. Chart and Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
        {/* Left: Stock Market Style Chart */}
        <div className="lg:col-span-2">
            <Card title="Yearly Overview: Investment vs Payout" className="h-full min-h-[350px]">
                <StockChart />
            </Card>
        </div>

        {/* Right: Portfolio Table */}
        <div className="lg:col-span-1">
            <Card title="Top Portfolios" className="h-full min-h-[350px] overflow-hidden">
                <div className="overflow-x-auto">
                    <Table 
                        columns={portfolioColumns}
                        data={portfolioTableData}
                        rowsPerPage={5}
                        keyExtractor={(row) => row.id}
                        emptyMessage="No portfolios"
                    />
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;