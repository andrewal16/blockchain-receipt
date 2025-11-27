import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const formatCurrency = (num) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

const formatThousand = (num) => {
  if (!num) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumber = (str) => {
  if (!str) return 0;
  return Number(str.toString().replace(/\./g, ""));
};

const DailyLimitSettings = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Default categories dengan limits
  const [categories, setCategories] = useState([
    { id: 1, name: "Electronics", limit: 50000000, icon: "💻", color: "blue" },
    {
      id: 2,
      name: "Office Supplies",
      limit: 10000000,
      icon: "📦",
      color: "purple",
    },
    { id: 3, name: "Services", limit: 100000000, icon: "🔧", color: "emerald" },
    {
      id: 4,
      name: "Raw Materials",
      limit: 200000000,
      icon: "🏭",
      color: "amber",
    },
    { id: 5, name: "Travel", limit: 30000000, icon: "✈️", color: "cyan" },
    {
      id: 6,
      name: "Meals & Entertainment",
      limit: 15000000,
      icon: "🍽️",
      color: "orange",
    },
    {
      id: 7,
      name: "Software Subscription",
      limit: 25000000,
      icon: "☁️",
      color: "indigo",
    },
    { id: 8, name: "Marketing", limit: 75000000, icon: "📢", color: "pink" },
  ]);

  // History of changes (mock data)
  const [changeHistory] = useState([
    {
      date: "2025-01-20",
      user: "CFO John Doe",
      category: "Electronics",
      oldLimit: 40000000,
      newLimit: 50000000,
    },
    {
      date: "2025-01-15",
      user: "CFO John Doe",
      category: "Services",
      oldLimit: 80000000,
      newLimit: 100000000,
    },
    {
      date: "2025-01-10",
      user: "CFO John Doe",
      category: "Marketing",
      oldLimit: 60000000,
      newLimit: 75000000,
    },
  ]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".page-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );

      tl.fromTo(
        ".info-banner",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.3"
      );

      tl.fromTo(
        ".category-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
        "-=0.2"
      );

      tl.fromTo(
        ".history-section",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.3"
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Success animation
  useEffect(() => {
    if (saveSuccess) {
      gsap.fromTo(
        ".success-banner",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
      );
    }
  }, [saveSuccess]);

  const handleLimitChange = (id, value) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, limit: parseNumber(value) } : cat
      )
    );
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);

    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSaving(false);
    setSaveSuccess(true);
    setHasChanges(false);

    // Hide success message after 3s
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const totalDailyBudget = categories.reduce((acc, cat) => acc + cat.limit, 0);

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={pageRef}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="page-header flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Daily Spending Limits
                </h1>
                <p className="text-slate-400 text-sm">CFO Control Panel</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="shadow-lg shadow-cyan-500/20"
              onClick={handleSaveAll}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Saving to Blockchain...
                </span>
              ) : (
                <>💾 Save All Changes</>
              )}
            </Button>
          </div>
        </div>

        {/* Success Banner */}
        {saveSuccess && (
          <div className="success-banner mb-6 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
              ✓
            </div>
            <div>
              <h4 className="text-emerald-400 font-bold">
                Limits Updated Successfully
              </h4>
              <p className="text-sm text-emerald-300/70">
                Changes have been recorded to blockchain (Block #1234567)
              </p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="info-banner mb-8 p-5 bg-blue-900/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h4 className="text-blue-300 font-bold mb-1">
              How Daily Limits Work
            </h4>
            <p className="text-sm text-blue-200/70 leading-relaxed">
              These limits control the maximum spending allowed per category
              each day. If an invoice exceeds the limit, it will require your
              manual approval. This prevents unauthorized large transactions and
              helps detect fraud attempts.
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Total Daily Budget
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(totalDailyBudget)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Across {categories.length} categories
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Active Categories
            </div>
            <div className="text-2xl font-bold text-white">
              {categories.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              All limits configured
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Last Updated
            </div>
            <div className="text-2xl font-bold text-white">2 days ago</div>
            <div className="text-xs text-slate-500 mt-1">By CFO John Doe</div>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
            Configure Limits by Category
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="category-item bg-slate-900/80 border border-white/5 rounded-xl p-6 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-${category.color}-500/10 border border-${category.color}-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg">
                      {category.name}
                    </h4>
                    <p className="text-slate-500 text-xs">
                      Daily spending limit
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
                      Maximum Amount (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={formatThousand(category.limit)}
                        onChange={(e) =>
                          handleLimitChange(category.id, e.target.value)
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white text-right focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all font-mono text-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Per Day Maximum</span>
                    <span className="text-cyan-400 font-bold font-mono">
                      {formatCurrency(category.limit)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Change History */}
        <div className="history-section">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Recent Changes History
          </h3>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Changed By
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Old Limit
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      New Limit
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {changeHistory.map((change, idx) => {
                    const diff = change.newLimit - change.oldLimit;
                    const percentChange = (
                      (diff / change.oldLimit) *
                      100
                    ).toFixed(1);
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {change.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          {change.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {change.user}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                          {formatCurrency(change.oldLimit)}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-mono font-bold">
                          {formatCurrency(change.newLimit)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                              diff > 0
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {diff > 0 ? "↑" : "↓"} {percentChange}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DailyLimitSettings;
