import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, formatDate } from "../utils/helpers";

const AuditorSubmissions = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  // State
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // --- MOCK DATA ---
  const submissions = [
    {
      id: "RCP-2025-00123",
      vendor: "Hotel Mulia Jakarta",
      amount: 2850000,
      date: "2025-01-18",
      category: "Travel",
      status: "verified",
      txHash: "0xabc123...def789",
      blockNumber: "1234567",
    },
    {
      id: "RCP-2025-00122",
      vendor: "Seafood Paradise",
      amount: 450000,
      date: "2025-01-17",
      category: "Meals",
      status: "verified",
      txHash: "0xdef456...abc123",
      blockNumber: "1234520",
    },
    {
      id: "RCP-2025-00121",
      vendor: "Office Depot Indo",
      amount: 1250000,
      date: "2025-01-16",
      category: "Supplies",
      status: "pending",
      txHash: null,
      blockNumber: null,
    },
    {
      id: "RCP-2025-00120",
      vendor: "Grab Transport",
      amount: 125000,
      date: "2025-01-15",
      category: "Travel",
      status: "verified",
      txHash: "0xghi789...jkl012",
      blockNumber: "1234480",
    },
    {
      id: "RCP-2025-00119",
      vendor: "AWS Cloud Services",
      amount: 5800000,
      date: "2025-01-14",
      category: "Software",
      status: "verified",
      txHash: "0xmno345...pqr678",
      blockNumber: "1234450",
    },
    {
      id: "RCP-2025-00118",
      vendor: "Tokopedia Ads",
      amount: 3200000,
      date: "2025-01-13",
      category: "Marketing",
      status: "failed",
      txHash: null,
      blockNumber: null,
    },
  ];

  const stats = {
    total: 45,
    verified: 41,
    pending: 2,
    failed: 2,
    totalAmount: 45750000,
  };

  // --- ANIMATION SETUP ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Header Fade In
      tl.fromTo(
        ".page-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );

      // 2. Stats Cards Stagger
      tl.fromTo(
        ".stat-card",
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
        "-=0.3"
      );

      // 3. Filters Bar
      tl.fromTo(
        ".filter-bar",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.2"
      );

      // 4. Table Rows Stagger
      tl.fromTo(
        ".table-row",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.05 },
        "-=0.4"
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // --- HELPERS ---
  const getStatusBadge = (status) => {
    const variants = {
      verified: "success",
      pending: "warning",
      failed: "error",
    };
    return variants[status] || "default";
  };

  const filteredSubmissions = submissions
    .filter((sub) => {
      if (selectedStatus !== "all" && sub.status !== selectedStatus)
        return false;
      if (
        searchQuery &&
        !sub.vendor.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !sub.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={pageRef}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* --- HEADER --- */}
        <div className="page-header flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                My Submissions
              </h1>
              <Badge
                variant="default"
                className="border-slate-700 text-slate-400"
              >
                Auditor View
              </Badge>
            </div>
            <p className="text-slate-400 max-w-xl">
              Track verification status and manage your receipt uploads.
            </p>
          </div>
          {/* Moved Action Button to Header for clearer hierarchy */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/upload")}
            className="shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
          >
            <span className="mr-2 font-bold text-lg">+</span> Upload New Receipt
          </Button>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="stat-card bg-slate-900/50 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Total Uploads
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-[10px] text-slate-500 mt-1">Lifetime</div>
          </div>

          <div className="stat-card bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div className="text-emerald-400 text-xs uppercase font-bold mb-2">
                Verified
              </div>
              <span className="text-emerald-500 text-lg">✓</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.verified}
            </div>
            <div className="text-[10px] text-emerald-500/60 mt-1">On-Chain</div>
          </div>

          <div className="stat-card bg-amber-900/10 border border-amber-500/20 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div className="text-amber-400 text-xs uppercase font-bold mb-2">
                Pending
              </div>
              <span className="text-amber-500 text-lg">⏳</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
            <div className="text-[10px] text-amber-500/60 mt-1">Processing</div>
          </div>

          <div className="stat-card bg-red-900/10 border border-red-500/20 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div className="text-red-400 text-xs uppercase font-bold mb-2">
                Failed
              </div>
              <span className="text-red-500 text-lg">✕</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.failed}</div>
            <div className="text-[10px] text-red-500/60 mt-1">
              Attention needed
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 p-5 rounded-2xl">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Total Value
            </div>
            <div className="text-xl font-bold text-white truncate">
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              IDR (Estimated)
            </div>
          </div>
        </div>

        {/* --- FILTERS TOOLBAR --- */}
        <div className="filter-bar mb-6 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-sm flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by ID or Vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-transparent focus:border-cyan-500/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-transparent hover:bg-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-300 focus:outline-none cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-transparent hover:bg-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="amount-desc">Highest Value</option>
              <option value="amount-asc">Lowest Value</option>
            </select>
          </div>
        </div>

        {/* --- TABLE CARD --- */}
        <Card className="bg-slate-900/50 border-white/5 overflow-hidden backdrop-blur-sm p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/30 text-xs uppercase text-slate-500">
                  <th className="py-4 px-6 font-bold tracking-wider">
                    Receipt ID
                  </th>
                  <th className="py-4 px-6 font-bold tracking-wider">
                    Vendor & Date
                  </th>
                  <th className="py-4 px-6 font-bold tracking-wider">Amount</th>
                  <th className="py-4 px-6 font-bold tracking-wider">
                    Category
                  </th>
                  <th className="py-4 px-6 font-bold tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="table-row group hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/receipt/${sub.id}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="font-mono text-sm text-cyan-400 group-hover:underline decoration-cyan-500/50 underline-offset-4">
                        {sub.id}
                      </div>
                      {sub.txHash && (
                        <div className="text-[10px] text-slate-600 font-mono mt-1 flex items-center gap-1">
                          <span>Tx:</span> {sub.txHash.slice(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium mb-0.5">
                        {sub.vendor}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(sub.date)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium font-mono">
                        {formatCurrency(sub.amount)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {sub.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusBadge(sub.status)} size="sm" dot>
                        {sub.status.charAt(0).toUpperCase() +
                          sub.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 hover:bg-slate-800 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/receipt/${sub.id}`);
                        }}
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4 opacity-20 grayscale">📋</div>
                <h3 className="text-white font-medium text-lg mb-1">
                  No submissions found
                </h3>
                <p className="text-slate-500 mb-6">
                  Try adjusting filters or upload a new receipt.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {filteredSubmissions.length > 0 && (
            <div className="border-t border-white/5 bg-slate-950/30 p-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="text-white font-medium">
                  {filteredSubmissions.length}
                </span>{" "}
                results
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded-lg text-xs bg-slate-800 border border-transparent hover:border-slate-600 text-slate-300 transition-all disabled:opacity-50"
                  disabled
                >
                  Previous
                </button>
                <button className="px-3 py-1 rounded-lg text-xs bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20">
                  1
                </button>
                <button className="px-3 py-1 rounded-lg text-xs bg-slate-800 border border-transparent hover:border-slate-600 text-slate-300 transition-all">
                  2
                </button>
                <button className="px-3 py-1 rounded-lg text-xs bg-slate-800 border border-transparent hover:border-slate-600 text-slate-300 transition-all">
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuditorSubmissions;
