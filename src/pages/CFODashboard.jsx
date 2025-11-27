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
  const dashboardRef = useRef(null);
  const [timeRange, setTimeRange] = useState("this-month");

  // Mock Data - Pending Approvals
  const [pendingApprovals] = useState({
    agreements: 2,
    invoices: 2,
    fraud: 2,
  });

  // Mock Data - Fraud Alerts (Recent)
  const [recentFraud] = useState([
    {
      id: "FRAUD-001",
      type: "Price Markup",
      severity: "high",
      timestamp: "2025-01-24 14:30",
      amount: 2000000,
    },
    {
      id: "FRAUD-002",
      type: "Quantity Exceeded",
      severity: "medium",
      timestamp: "2025-01-23 16:45",
      amount: 0,
    },
  ]);

  // Dashboard Stats
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
      limit: 50000000,
      todayUsed: 30000000,
    },
    {
      category: "Meals",
      amount: 12300000,
      count: 38,
      percentage: 14.1,
      color: "bg-emerald-500",
      limit: 15000000,
      todayUsed: 8000000,
    },
    {
      category: "Supplies",
      amount: 15600000,
      count: 28,
      percentage: 17.8,
      color: "bg-purple-500",
      limit: 10000000,
      todayUsed: 4000000,
    },
    {
      category: "Software",
      amount: 18200000,
      count: 22,
      percentage: 20.8,
      color: "bg-cyan-500",
      limit: 25000000,
      todayUsed: 12000000,
    },
    {
      category: "Marketing",
      amount: 9850000,
      count: 15,
      percentage: 11.3,
      color: "bg-orange-500",
      limit: 75000000,
      todayUsed: 20000000,
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
  ];

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dashboard-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      gsap.fromTo(
        ".alert-banner",
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.5)",
          delay: 0.2,
        }
      );

      gsap.fromTo(
        ".stat-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.2)",
          delay: 0.3,
        }
      );

      gsap.fromTo(
        ".content-block",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.5,
        }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  const totalPending =
    pendingApprovals.agreements +
    pendingApprovals.invoices +
    pendingApprovals.fraud;
  const maxAmount = Math.max(...categoryData.map((c) => c.amount));

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={dashboardRef}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Header */}
        <div className="dashboard-header flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-white/5 pb-6">
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

        {/* CRITICAL: Pending Approvals Alert Banner */}
        {totalPending > 0 && (
          <div className="alert-banner mb-8 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center text-3xl animate-pulse">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-amber-400 font-bold text-xl mb-1">
                    {totalPending} Items Need Your Approval
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {pendingApprovals.agreements > 0 && (
                      <span className="text-amber-200/80">
                        📋 {pendingApprovals.agreements} Agreements
                      </span>
                    )}
                    {pendingApprovals.invoices > 0 && (
                      <span className="text-amber-200/80">
                        💰 {pendingApprovals.invoices} Invoices Over Limit
                      </span>
                    )}
                    {pendingApprovals.fraud > 0 && (
                      <span className="text-red-400 font-bold">
                        🚨 {pendingApprovals.fraud} Fraud Alerts
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/approvals")}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20"
              >
                Review Now →
              </Button>
            </div>
          </div>
        )}

        {/* Fraud Alerts (If Any) */}
        {recentFraud.length > 0 && (
          <div className="alert-banner mb-8 bg-red-950/50 border-2 border-red-500/50 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl animate-pulse"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🚨</span>
                <h3 className="text-red-400 font-bold text-lg">
                  Recent Fraud Detection Alerts
                </h3>
              </div>
              <div className="space-y-2">
                {recentFraud.map((fraud) => (
                  <div
                    key={fraud.id}
                    className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="error" size="sm">
                        {fraud.type}
                      </Badge>
                      <span className="text-sm text-slate-300">
                        {fraud.timestamp}
                      </span>
                      {fraud.amount > 0 && (
                        <span className="text-sm text-red-400 font-mono">
                          +{formatCurrency(fraud.amount)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate("/approvals?tab=fraud")}
                      className="text-xs text-red-400 hover:text-red-300 font-bold"
                    >
                      Review →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* ZK Promo Banner */}
        <div className="content-block mb-8 relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 to-slate-800 shadow-[0_0_40px_-15px_rgba(6,182,212,0.2)]">
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
                  {zkStats.activeProofs} proofs running •{" "}
                  {zkStats.totalVerifications} external verifications • Privacy
                  preserved
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

        {/* Daily Spending Limits Overview */}
        <div className="content-block mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white text-lg">
                Today's Spending by Category
              </h3>
              <p className="text-slate-500 text-sm">
                Real-time daily limit tracking
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings/daily-limits")}
            >
              Manage Limits →
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {categoryData.map((cat, idx) => {
              const usagePercent = (cat.todayUsed / cat.limit) * 100;
              const isNearLimit = usagePercent > 80;

              return (
                <div
                  key={idx}
                  className="bg-slate-900/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${cat.color}`}
                      ></div>
                      <span className="text-white font-bold">
                        {cat.category}
                      </span>
                    </div>
                    {isNearLimit && (
                      <Badge variant="warning" size="sm">
                        Near Limit
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Today's Usage:</span>
                      <span className="text-white font-mono font-bold">
                        {formatCurrency(cat.todayUsed)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Daily Limit:</span>
                      <span className="text-slate-500 font-mono">
                        {formatCurrency(cat.limit)}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{usagePercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isNearLimit ? "bg-amber-500" : cat.color
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Trend */}
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
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none z-10">
                        {formatCurrency(m.amount)}
                      </div>
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

          {/* Quick Actions */}
          <div className="content-block lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/approvals")}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl p-4 text-left transition-all group"
              >
                <div className="text-2xl mb-2">📋</div>
                <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Review Approvals
                </div>
                <div className="text-xs text-slate-500">
                  {totalPending} pending items
                </div>
              </button>

              <button
                onClick={() => navigate("/agreements")}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl p-4 text-left transition-all group"
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Agreements
                </div>
                <div className="text-xs text-slate-500">Manage contracts</div>
              </button>

              <button
                onClick={() => navigate("/settings/daily-limits")}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl p-4 text-left transition-all group"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Daily Limits
                </div>
                <div className="text-xs text-slate-500">
                  Configure spending caps
                </div>
              </button>

              <button
                onClick={() => navigate("/reports")}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl p-4 text-left transition-all group"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Generate Report
                </div>
                <div className="text-xs text-slate-500">Export & analyze</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CFODashboard;
