import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, formatDate } from "../utils/helpers";

const ZKDashboard = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // --- MOCK DATA (Sama seperti sebelumnya) ---
  const zkProofs = [
    {
      id: "ZKP-2025-001",
      name: "Q4 2024 Travel Expenses - Investor Report",
      category: "Travel",
      dateRange: { start: "2024-10-01", end: "2024-12-31" },
      rangeProof: { min: 20000000, max: 50000000 },
      actualAmount: 28500000,
      status: "verified",
      createdAt: "2025-01-15",
      expiresAt: "2025-04-15",
      verificationsCount: 12,
      lastVerified: "2025-01-18",
      purpose: "Quarterly investor compliance report",
      isPublic: true,
      verificationUrl: "/zk/verify/ZKP-2025-001",
    },
    {
      id: "ZKP-2025-002",
      name: "January 2025 Software Expenses",
      category: "Software",
      dateRange: { start: "2025-01-01", end: "2025-01-31" },
      rangeProof: { min: 10000000, max: 30000000 },
      actualAmount: 18200000,
      status: "active",
      createdAt: "2025-01-20",
      expiresAt: "2025-07-20",
      verificationsCount: 5,
      lastVerified: "2025-01-21",
      purpose: "Monthly expense audit",
      isPublic: true,
      verificationUrl: "/zk/verify/ZKP-2025-002",
    },
    {
      id: "ZKP-2024-125",
      name: "Annual Marketing Budget 2024",
      category: "Marketing",
      dateRange: { start: "2024-01-01", end: "2024-12-31" },
      rangeProof: { min: 50000000, max: 150000000 },
      actualAmount: 89600000,
      status: "expired",
      createdAt: "2024-12-28",
      expiresAt: "2025-01-15",
      verificationsCount: 28,
      lastVerified: "2025-01-14",
      purpose: "Annual shareholder report",
      isPublic: false,
      verificationUrl: "/zk/verify/ZKP-2024-125",
    },
  ];

  const stats = {
    totalProofs: 24,
    activeProofs: 18,
    totalVerifications: 156,
    expiringProofs: 3,
  };

  const useCaseTemplates = [
    {
      icon: "👥",
      title: "Investor Report",
      description: "Prove spending range",
      color: "bg-blue-500",
    },
    {
      icon: "🏦",
      title: "Regulatory Audit",
      description: "Compliance proof",
      color: "bg-purple-500",
    },
    {
      icon: "📊",
      title: "Board Meeting",
      description: "Budget adherence",
      color: "bg-amber-500",
    },
    {
      icon: "🔍",
      title: "Internal Audit",
      description: "Dept verification",
      color: "bg-emerald-500",
    },
  ];

  // --- ANIMATION UPGRADE ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Header Fade Down
      tl.fromTo(
        ".page-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );

      // 2. Stats Cards (Bento Grid Stagger)
      tl.fromTo(
        ".stat-card",
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
        "-=0.3"
      );

      // 3. Templates (Slide In)
      tl.fromTo(
        ".template-item",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.05 },
        "-=0.2"
      );

      // 4. Controls & List
      tl.fromTo(
        ".content-area",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.2"
      );

      // 5. Proof Items
      tl.fromTo(
        ".proof-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
        "-=0.5"
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // --- HELPERS ---
  const getStatusBadge = (status) => {
    const variants = {
      verified: "success",
      active: "success",
      pending: "warning",
      expired: "error",
    };
    return variants[status] || "default";
  };

  const filteredProofs = zkProofs
    .filter((proof) => {
      if (selectedFilter !== "all" && proof.status !== selectedFilter)
        return false;
      if (
        searchQuery &&
        !proof.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !proof.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc")
        return new Date(b.createdAt) - new Date(a.createdAt);
      // ... other sorts
      return 0;
    });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(window.location.origin + text);
    // Toast implementation here
  };

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={pageRef}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* --- HEADER SECTION --- */}
        <div className="page-header flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="relative">
            {/* Decorative Blur */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-2 relative z-10">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                ZK Proofs Center
              </h1>
              <Badge
                variant="premium"
                className="shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              >
                PRO
              </Badge>
            </div>
            <p className="text-slate-400 max-w-lg text-lg">
              Generate and manage privacy-preserving audit trails.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
            onClick={() => navigate("/zk/generate")}
          >
            <span className="mr-2 text-lg">+</span> Generate Proof
          </Button>
        </div>

        {/* --- STATS OVERVIEW (BENTO GRID STYLE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="stat-card bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/5 p-6 rounded-2xl backdrop-blur-md group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="text-slate-400 text-sm font-medium">
                Total Proofs
              </div>
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-300">
                🔒
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalProofs}
            </div>
            <div className="text-xs text-slate-500">Lifetime generated</div>
          </div>

          <div className="stat-card bg-gradient-to-br from-emerald-900/20 to-slate-900/60 border border-emerald-500/20 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-4 -mt-4 transition-all group-hover:bg-emerald-500/20"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="text-emerald-400 text-sm font-medium">
                Active & Valid
              </div>
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                ✓
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1 relative z-10">
              {stats.activeProofs}
            </div>
            <div className="text-xs text-emerald-500/70 relative z-10">
              Ready for audit
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/5 p-6 rounded-2xl backdrop-blur-md hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="text-slate-400 text-sm font-medium">
                Verifications
              </div>
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-300">
                👁️
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalVerifications}
            </div>
            <div className="text-xs text-slate-500">External views</div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-900/20 to-slate-900/60 border border-amber-500/20 p-6 rounded-2xl backdrop-blur-md hover:border-amber-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="text-amber-400 text-sm font-medium">
                Expiring Soon
              </div>
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
                ⚠️
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.expiringProofs}
            </div>
            <div className="text-xs text-amber-500/70">Action required</div>
          </div>
        </div>

        {/* --- QUICK TEMPLATES --- */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
            Quick Start Templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCaseTemplates.map((template, index) => (
              <button
                key={index}
                className="template-item text-left group bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 p-4 rounded-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() =>
                  navigate(
                    `/zk/generate?template=${template.title
                      .toLowerCase()
                      .replace(" ", "-")}`
                  )
                }
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 ${template.color} bg-opacity-20 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform`}
                  >
                    {template.icon}
                  </div>
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    {template.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 group-hover:text-slate-400 pl-11">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="content-area space-y-6">
          {/* Filters Toolbar */}
          <div className="flex flex-col lg:flex-row gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
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
                placeholder="Search proofs by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-transparent focus:border-cyan-500/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-0 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-transparent hover:bg-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-300 focus:outline-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="verified">Verified</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-transparent hover:bg-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="date-desc">Newest</option>
                <option value="date-asc">Oldest</option>
                <option value="verifications-desc">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Proof List */}
          <div className="space-y-4">
            {filteredProofs.map((proof) => (
              <div
                key={proof.id}
                className="proof-item group bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/zk/verify/${proof.id}`)}
              >
                {/* Left Accent Border on Hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {proof.name}
                      </h3>
                      <Badge
                        variant={getStatusBadge(proof.status)}
                        size="sm"
                        dot
                      >
                        {proof.status}
                      </Badge>
                      {proof.isPublic && (
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full">
                          Public
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 text-sm mb-4 max-w-2xl">
                      {proof.purpose}
                    </p>

                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>📅</span>
                        <span className="text-slate-300">
                          {formatDate(proof.dateRange.start, "short")} -{" "}
                          {formatDate(proof.dateRange.end, "short")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>💰</span>
                        <span className="text-slate-300 font-mono">
                          {formatCurrency(proof.rangeProof.min)} -{" "}
                          {formatCurrency(proof.rangeProof.max)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>🆔</span>
                        <span className="text-slate-500 font-mono">
                          {proof.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 lg:border-l lg:border-white/5 lg:pl-6">
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold text-white">
                        {proof.verificationsCount}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Verifications
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(proof.verificationUrl);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 border-transparent"
                      >
                        Copy Link
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 hover:bg-cyan-500/10"
                      >
                        View →
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar for Expiry */}
                {proof.status === "active" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
                    <div
                      className="h-full bg-cyan-500/50"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((new Date(proof.expiresAt) - new Date()) /
                              (new Date(proof.expiresAt) -
                                new Date(proof.createdAt))) *
                              100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}

            {filteredProofs.length === 0 && (
              <div className="text-center py-20 bg-slate-900/30 border border-white/5 border-dashed rounded-2xl">
                <div className="text-5xl mb-4 opacity-20">🔍</div>
                <h3 className="text-white font-medium text-lg mb-1">
                  No proofs found
                </h3>
                <p className="text-slate-500 mb-6">
                  Try adjusting your search or filters.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZKDashboard;
