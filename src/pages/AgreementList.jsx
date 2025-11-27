import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, formatDate } from "../utils/helpers";

const AgreementList = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // Mock Data - Purchase Agreements
  const [agreements] = useState([
    {
      id: "AGR-2025-001",
      vendor: "PT Supplier ABC",
      category: "Electronics",
      itemName: "Laptop Dell Latitude 5420",
      pricePerUnit: 8000000,
      totalQuantity: 10,
      usedQuantity: 4,
      totalValue: 80000000,
      contractPeriod: { start: "2025-01-01", end: "2025-12-31" },
      paymentTerms: "installment",
      status: "active",
      createdAt: "2025-01-15",
      createdBy: "Finance Team",
      approvedBy: "CFO John Doe",
      contractAddress: "0xabc123...def789",
    },
    {
      id: "AGR-2025-002",
      vendor: "PT Tech Solutions",
      category: "Software Subscription",
      itemName: "Cloud Storage Enterprise",
      pricePerUnit: 5000000,
      totalQuantity: 12,
      usedQuantity: 0,
      totalValue: 60000000,
      contractPeriod: { start: "2025-02-01", end: "2026-01-31" },
      paymentTerms: "full",
      status: "pending-vendor",
      createdAt: "2025-01-20",
      createdBy: "Finance Team",
      approvedBy: null,
      contractAddress: null,
    },
    {
      id: "AGR-2025-003",
      vendor: "PT Office Mart",
      category: "Office Supplies",
      itemName: "Printer Canon G3020",
      pricePerUnit: 2500000,
      totalQuantity: 5,
      usedQuantity: 0,
      totalValue: 12500000,
      contractPeriod: { start: "2025-01-18", end: "2025-06-30" },
      paymentTerms: "full",
      status: "pending-cfo",
      createdAt: "2025-01-18",
      createdBy: "Finance Team",
      approvedBy: null,
      contractAddress: null,
    },
    {
      id: "AGR-2024-125",
      vendor: "PT Industrial Supply",
      category: "Raw Materials",
      itemName: "Steel Sheets Grade A",
      pricePerUnit: 15000000,
      totalQuantity: 100,
      usedQuantity: 100,
      totalValue: 1500000000,
      contractPeriod: { start: "2024-06-01", end: "2024-12-31" },
      paymentTerms: "installment",
      status: "expired",
      createdAt: "2024-05-20",
      createdBy: "Finance Team",
      approvedBy: "CFO John Doe",
      contractAddress: "0xdef456...abc123",
    },
    {
      id: "AGR-2025-004",
      vendor: "PT Digital Services",
      category: "Services",
      itemName: "IT Support & Maintenance",
      pricePerUnit: 25000000,
      totalQuantity: 12,
      usedQuantity: 2,
      totalValue: 300000000,
      contractPeriod: { start: "2025-01-10", end: "2025-12-31" },
      paymentTerms: "full",
      status: "active",
      createdAt: "2025-01-08",
      createdBy: "Finance Team",
      approvedBy: "CFO John Doe",
      contractAddress: "0xghi789...jkl012",
    },
  ]);

  // Stats
  const stats = {
    total: agreements.length,
    active: agreements.filter((a) => a.status === "active").length,
    pending: agreements.filter((a) => a.status.includes("pending")).length,
    expired: agreements.filter((a) => a.status === "expired").length,
    totalValue: agreements.reduce((acc, a) => acc + a.totalValue, 0),
  };

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
        ".stat-card",
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
        "-=0.3"
      );

      tl.fromTo(
        ".filter-bar",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.2"
      );

      tl.fromTo(
        ".agreement-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
        "-=0.3"
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Helpers
  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      "pending-vendor": "warning",
      "pending-cfo": "warning",
      expired: "default",
      rejected: "error",
    };
    return variants[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "Active",
      "pending-vendor": "Pending Vendor",
      "pending-cfo": "Pending CFO",
      expired: "Expired",
      rejected: "Rejected",
    };
    return labels[status] || status;
  };

  const filteredAgreements = agreements
    .filter((agreement) => {
      if (selectedStatus !== "all" && agreement.status !== selectedStatus)
        return false;
      if (
        searchQuery &&
        !agreement.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !agreement.vendor.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !agreement.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "date-asc")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "value-desc") return b.totalValue - a.totalValue;
      if (sortBy === "value-asc") return a.totalValue - b.totalValue;
      return 0;
    });

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
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Purchase Agreements
              </h1>
              <Badge
                variant="default"
                className="border-slate-700 text-slate-400"
              >
                Management Center
              </Badge>
            </div>
            <p className="text-slate-400 max-w-xl">
              View and manage all purchase agreements with vendors.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/agreements/create")}
            className="shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
          >
            <span className="mr-2 font-bold text-lg">+</span> Create Agreement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="stat-card bg-slate-900/50 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Total Agreements
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-[10px] text-slate-500 mt-1">All time</div>
          </div>

          <div className="stat-card bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div className="text-emerald-400 text-xs uppercase font-bold mb-2">
                Active
              </div>
              <span className="text-emerald-500 text-lg">✓</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.active}</div>
            <div className="text-[10px] text-emerald-500/60 mt-1">
              Ready to use
            </div>
          </div>

          <div className="stat-card bg-amber-900/10 border border-amber-500/20 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div className="text-amber-400 text-xs uppercase font-bold mb-2">
                Pending
              </div>
              <span className="text-amber-500 text-lg">⏳</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
            <div className="text-[10px] text-amber-500/60 mt-1">
              Awaiting approval
            </div>
          </div>

          <div className="stat-card bg-slate-900/50 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div className="text-slate-400 text-xs uppercase font-bold mb-2">
                Expired
              </div>
              <span className="text-slate-500 text-lg">⊗</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.expired}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              Past contracts
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 p-5 rounded-2xl">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Total Value
            </div>
            <div className="text-lg font-bold text-white truncate">
              {formatCurrency(stats.totalValue)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              IDR (Aggregate)
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
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
              placeholder="Search by ID, Vendor, or Item..."
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
              <option value="active">Active</option>
              <option value="pending-vendor">Pending Vendor</option>
              <option value="pending-cfo">Pending CFO</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-transparent hover:bg-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="value-desc">Highest Value</option>
              <option value="value-asc">Lowest Value</option>
            </select>
          </div>
        </div>

        {/* Agreements Grid */}
        <div className="space-y-4">
          {filteredAgreements.map((agreement) => {
            const remainingQty =
              agreement.totalQuantity - agreement.usedQuantity;
            const usagePercent =
              (agreement.usedQuantity / agreement.totalQuantity) * 100;

            return (
              <div
                key={agreement.id}
                className="agreement-card group bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/agreements/${agreement.id}`)}
              >
                {/* Left Accent Border */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {agreement.itemName}
                      </h3>
                      <Badge
                        variant={getStatusBadge(agreement.status)}
                        size="sm"
                        dot
                      >
                        {getStatusLabel(agreement.status)}
                      </Badge>
                      {agreement.contractAddress && (
                        <span className="text-[10px] uppercase tracking-wider text-emerald-500 border border-emerald-700 px-2 py-0.5 rounded-full">
                          On-Chain
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>🏢</span>
                        <span className="text-slate-300">
                          {agreement.vendor}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>📦</span>
                        <span className="text-slate-300">
                          {agreement.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>🆔</span>
                        <span className="text-slate-500 font-mono text-xs">
                          {agreement.id}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs mb-1">
                          Price/Unit
                        </div>
                        <div className="text-white font-mono font-bold">
                          {formatCurrency(agreement.pricePerUnit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs mb-1">
                          Total Qty
                        </div>
                        <div className="text-white font-bold">
                          {agreement.totalQuantity} units
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs mb-1">
                          Remaining
                        </div>
                        <div
                          className={`font-bold ${
                            remainingQty === 0
                              ? "text-slate-500"
                              : "text-cyan-400"
                          }`}
                        >
                          {remainingQty} units
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs mb-1">
                          Total Value
                        </div>
                        <div className="text-white font-mono font-bold">
                          {formatCurrency(agreement.totalValue)}
                        </div>
                      </div>
                    </div>

                    {/* Usage Progress Bar */}
                    {agreement.status === "active" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Usage Progress</span>
                          <span>{usagePercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-500"
                            style={{ width: `${usagePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6 lg:min-w-[200px]">
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-bold mb-2">
                        Contract Period
                      </div>
                      <div className="text-sm text-white mb-1">
                        {formatDate(agreement.contractPeriod.start, "short")}
                      </div>
                      <div className="text-sm text-white mb-3">
                        {formatDate(agreement.contractPeriod.end, "short")}
                      </div>

                      <div className="text-xs text-slate-500 uppercase font-bold mb-2">
                        Payment Terms
                      </div>
                      <div className="text-sm text-white">
                        {agreement.paymentTerms === "full"
                          ? "Full Payment"
                          : "Installment"}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/agreements/${agreement.id}`);
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 border-transparent text-xs"
                      >
                        Details
                      </Button>
                      {agreement.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-cyan-400 hover:bg-cyan-500/10 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/upload?agreement=${agreement.id}`);
                          }}
                        >
                          Use →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAgreements.length === 0 && (
            <div className="text-center py-20 bg-slate-900/30 border border-white/5 border-dashed rounded-2xl">
              <div className="text-5xl mb-4 opacity-20">📄</div>
              <h3 className="text-white font-medium text-lg mb-1">
                No agreements found
              </h3>
              <p className="text-slate-500 mb-6">
                Try adjusting your search or filters.
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
      </div>
    </div>
  );
};

export default AgreementList;
