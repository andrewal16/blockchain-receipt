import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, formatDate } from "../utils/helpers";

const CFODashboard = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null); // Scope untuk GSAP
  const [timeRange, setTimeRange] = useState("this-month");

  // --- MOCK DATA ---
  const dashboardStats = {
    totalReceipts: 156,
    totalAmount: 87450000,
    thisMonthSubmissions: 45,
    pendingVerifications: 3,
    averageProcessingTime: "8.5m",
    complianceRate: 98.5,
  };

  const zkStats = {
    activeProofs: 4,
    expiringSoon: 1,
    totalVerifications: 28,
  };

  const categoryData = [
    {
      category: "Travel",
      amount: 28500000,
      count: 45,
      percentage: 32.6,
      color: "bg-blue-500",
    },
    {
      category: "Meals",
      amount: 12300000,
      count: 38,
      percentage: 14.1,
      color: "bg-emerald-500",
    },
    {
      category: "Supplies",
      amount: 15600000,
      count: 28,
      percentage: 17.8,
      color: "bg-purple-500",
    },
    {
      category: "Software",
      amount: 18200000,
      count: 22,
      percentage: 20.8,
      color: "bg-cyan-500",
    },
    {
      category: "Marketing",
      amount: 9850000,
      count: 15,
      percentage: 11.3,
      color: "bg-orange-500",
    },
  ];

  const monthlyTrend = [
    { month: "Jul", amount: 65000000 },
    { month: "Aug", amount: 72000000 },
    { month: "Sep", amount: 68000000 },
    { month: "Oct", amount: 81000000 },
    { month: "Nov", amount: 76000000 },
    { month: "Dec", amount: 87000000 },
  ];

  const recentReceipts = [
    {
      id: "RCP-00123",
      auditor: "Auditor #1",
      vendor: "Hotel Mulia",
      amount: 2850000,
      date: "2025-01-18",
      status: "verified",
    },
    {
      id: "RCP-00122",
      auditor: "Auditor #3",
      vendor: "AWS Cloud",
      amount: 450000,
      date: "2025-01-17",
      status: "verified",
    },
    {
      id: "RCP-00121",
      auditor: "Auditor #2",
      vendor: "Apple Store",
      amount: 12500000,
      date: "2025-01-16",
      status: "pending",
    },
    {
      id: "RCP-00120",
      auditor: "Auditor #1",
      vendor: "Grab Corp",
      amount: 125000,
      date: "2025-01-16",
      status: "verified",
    },
  ];

  // --- ANIMATION LOGIC (FIXED) ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Animation
      gsap.fromTo(
        ".dashboard-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      // 2. Stats Cards (Staggered)
      gsap.fromTo(
        ".stat-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.2)",
          delay: 0.2,
        }
      );

      // 3. ZK Promo Banner (Scale Up)
      gsap.fromTo(
        ".zk-banner",
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power4.out", delay: 0.4 }
      );

      // 4. Charts & Main Content
      gsap.fromTo(
        ".content-block",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.6,
        }
      );

      // 5. Table Rows
      gsap.fromTo(
        ".table-row",
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          delay: 1,
        }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  const maxAmount = Math.max(...categoryData.map((c) => c.amount));

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={dashboardRef}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* --- HEADER SECTION --- */}
        <div className="dashboard-header flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">
                Financial Overview
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Data
              </span>
            </div>
            <p className="text-slate-400">
              Welcome back, Chief Financial Officer
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-lg border border-white/10">
            {["This Month", "Quarter", "Year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeRange === range
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* --- KEY METRICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Spend */}
          <div className="stat-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                💰
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                ↑ 12%
              </span>
            </div>
            <div className="text-slate-400 text-sm mb-1">
              Total Verified Spend
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(dashboardStats.totalAmount)}
            </div>
          </div>

          {/* Receipt Volume */}
          <div className="stat-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                📄
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                ↑ 8%
              </span>
            </div>
            <div className="text-slate-400 text-sm mb-1">
              Receipts Processed
            </div>
            <div className="text-2xl font-bold text-white">
              {dashboardStats.totalReceipts}
            </div>
          </div>

          {/* Compliance Score */}
          <div className="stat-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <span className="text-xs font-medium text-slate-400">
                Target: 99%
              </span>
            </div>
            <div className="text-slate-400 text-sm mb-1">Compliance Rate</div>
            <div className="text-2xl font-bold text-white">
              {dashboardStats.complianceRate}%
            </div>
          </div>

          {/* Pending Actions */}
          <div className="stat-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                Action Needed
              </span>
            </div>
            <div className="text-slate-400 text-sm mb-1">Pending Review</div>
            <div className="text-2xl font-bold text-white">
              {dashboardStats.pendingVerifications}{" "}
              <span className="text-sm font-normal text-slate-500">items</span>
            </div>
          </div>
        </div>

        {/* --- ZK PROMO BANNER (HERO FEATURE) --- */}
        <div className="zk-banner mb-8 relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 to-slate-800 shadow-[0_0_40px_-15px_rgba(6,182,212,0.2)]">
          {/* Abstract BG Shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20">
                🔒
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Zero-Knowledge Audits Active
                </h3>
                <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
                  Your financial data is cryptographically proven without
                  revealing sensitive details. You have{" "}
                  <strong className="text-cyan-400">
                    {zkStats.activeProofs} active proofs
                  </strong>{" "}
                  running.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/zk/generate")}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950"
              >
                + New Proof
              </Button>
              <Button
                variant="primary"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/20"
                onClick={() => navigate("/zk/dashboard")}
              >
                Open ZK Center
              </Button>
            </div>
          </div>
        </div>

        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 1. Spending Distribution (Custom Bar Chart) */}
          <div className="content-block lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-lg">
                Spending Distribution
              </h3>
              <button className="text-xs text-slate-400 hover:text-white transition-colors">
                View Details
              </button>
            </div>

            <div className="space-y-4">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${cat.color}`}
                      ></div>
                      <span className="text-slate-300 font-medium">
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 text-xs">
                        {cat.count} txs
                      </span>
                      <span className="text-white font-mono">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color} opacity-80 group-hover:opacity-100 transition-all duration-500`}
                      style={{ width: `${(cat.amount / maxAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Monthly Trend (Simple CSS Columns) */}
          <div className="content-block bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-white text-lg">6-Month Trend</h3>
              <p className="text-xs text-slate-500">Burn rate analysis</p>
            </div>

            <div className="flex-1 flex items-end justify-between gap-2 h-48">
              {monthlyTrend.map((m, idx) => {
                const height = (m.amount / 90000000) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative w-full">
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none z-10">
                        {formatCurrency(m.amount)}
                      </div>
                      {/* Bar */}
                      <div
                        className="w-full bg-slate-700 hover:bg-cyan-500 rounded-t-sm transition-all duration-300"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500 mt-2">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- RECENT TRANSACTIONS (Table) --- */}
        <div className="content-block bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">
              Recent Transactions
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auditor/submissions")}
            >
              View Full Ledger →
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Vendor</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Auditor</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentReceipts.map((row) => (
                  <tr
                    key={row.id}
                    className="table-row group hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/receipt/${row.id}`)}
                  >
                    <td className="px-6 py-4 font-mono text-sm text-cyan-400 group-hover:underline">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {row.vendor}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {row.auditor}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          row.status === "verified" ? "success" : "warning"
                        }
                        size="sm"
                        dot
                      >
                        {row.status === "verified" ? "Verified" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CFODashboard;
