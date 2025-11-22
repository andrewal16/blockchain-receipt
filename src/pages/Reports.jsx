import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, formatDate } from "../utils/helpers";

const Reports = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Form state
  const [dateRange, setDateRange] = useState({
    start: "2025-01-01",
    end: "2025-01-31",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAuditors, setSelectedAuditors] = useState([]);
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [reportFormat, setReportFormat] = useState("pdf");
  const [includeBlockchainProof, setIncludeBlockchainProof] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Mock Data
  const categories = [
    "Travel",
    "Meals",
    "Office Supplies",
    "Software",
    "Marketing",
    "Equipment",
    "Utilities",
  ];

  const auditors = [
    { address: "0x742d...3f8a", name: "John Doe", avatar: "JD" },
    { address: "0x8e5b...2c1d", name: "Jane Smith", avatar: "JS" },
    { address: "0x3a9f...7b4e", name: "Bob Johnson", avatar: "BJ" },
  ];

  const savedReports = [
    {
      id: "RPT-001",
      name: "Jan 2025 Full Report",
      date: "2025-01-31",
      type: "PDF",
      size: "2.4 MB",
    },
    {
      id: "RPT-002",
      name: "Q4 2024 Travel",
      date: "2025-01-15",
      type: "XLS",
      size: "1.8 MB",
    },
  ];

  const previewReceipts = [
    {
      id: "RCP-00123",
      vendor: "Hotel Mulia",
      amount: 2850000,
      date: "2025-01-18",
      cat: "Travel",
      hash: "0x74...3f8a",
    },
    {
      id: "RCP-00122",
      vendor: "Seafood Paradise",
      amount: 450000,
      date: "2025-01-17",
      cat: "Meals",
      hash: "0x8e...2c1d",
    },
    {
      id: "RCP-00121",
      vendor: "Office Depot",
      amount: 1250000,
      date: "2025-01-16",
      cat: "Supplies",
      hash: "0x74...3f8a",
    },
  ];

  // --- GSAP ANIMATIONS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Header Fade
      tl.fromTo(
        ".page-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );

      // 2. Left Panel (Config)
      tl.fromTo(
        ".config-panel",
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6 },
        "-=0.4"
      );

      // 3. Right Panel (Sidebar)
      tl.fromTo(
        ".sidebar-item",
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        "-=0.4"
      );

      // 4. Section Content Stagger
      tl.fromTo(
        ".config-section",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        "-=0.2"
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Animation for Preview Toggle
  useEffect(() => {
    if (!containerRef.current) return;
    if (showPreview) {
      gsap.fromTo(
        ".preview-panel",
        { height: 0, opacity: 0, marginTop: 0 },
        {
          height: "auto",
          opacity: 1,
          marginTop: 32,
          duration: 0.6,
          ease: "power3.inOut",
        }
      );
    }
  }, [showPreview]);

  // Handlers
  const toggleItem = (item, list, setList) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleGenerate = () => {
    // Simulate loading
    const btn = document.getElementById("generate-btn");
    if (btn) btn.innerText = "Generating...";
    setTimeout(() => {
      if (btn) btn.innerText = "Generate Report";
      alert("Report Generated Successfully!");
    }, 1500);
  };

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={containerRef}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* --- HEADER --- */}
        <div className="page-header mb-8 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">
                Report Generator
              </h1>
              <Badge
                variant="default"
                className="border-slate-700 text-slate-400"
              >
                Audit Tools
              </Badge>
            </div>
            <p className="text-slate-400 max-w-xl">
              Create granular financial reports validated by blockchain proofs.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Hide Preview" : "Show Live Preview"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* --- LEFT COLUMN: CONFIGURATION --- */}
          <div className="config-panel lg:col-span-2 space-y-6">
            {/* 1. Time Period */}
            <Card className="config-section bg-slate-900/50 border-white/5 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>{" "}
                  Time Period
                </h2>
                <div className="flex bg-slate-800 rounded-lg p-1">
                  {["Month", "Quarter", "Year"].map((p) => (
                    <button
                      key={p}
                      className="px-3 py-1 text-xs font-medium rounded hover:bg-slate-700 text-slate-400 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">
                    From
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
                  />
                </div>
                <div className="group">
                  <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">
                    To
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>
            </Card>

            {/* 2. Filters (Category & Auditor) */}
            <Card className="config-section bg-slate-900/50 border-white/5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-purple-500 rounded-full"></span>{" "}
                Filters
              </h2>

              <div className="mb-6">
                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        toggleItem(
                          cat,
                          selectedCategories,
                          setSelectedCategories
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selectedCategories.includes(cat)
                          ? "bg-purple-500/20 border-purple-500 text-purple-300"
                          : "bg-slate-800 border-transparent text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">
                  Auditors
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {auditors.map((auditor) => (
                    <button
                      key={auditor.address}
                      onClick={() =>
                        toggleItem(
                          auditor.address,
                          selectedAuditors,
                          setSelectedAuditors
                        )
                      }
                      className={`flex items-center gap-3 p-2 rounded-xl border transition-all text-left ${
                        selectedAuditors.includes(auditor.address)
                          ? "bg-slate-800 border-cyan-500/50 ring-1 ring-cyan-500/50"
                          : "bg-slate-800/50 border-transparent hover:bg-slate-800"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                        {auditor.avatar}
                      </div>
                      <div className="overflow-hidden">
                        <div
                          className={`text-sm font-medium truncate ${
                            selectedAuditors.includes(auditor.address)
                              ? "text-white"
                              : "text-slate-400"
                          }`}
                        >
                          {auditor.name}
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono truncate">
                          {auditor.address}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* 3. Export Settings */}
            <Card className="config-section bg-slate-900/50 border-white/5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>{" "}
                Output Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { id: "pdf", label: "PDF Document", icon: "📄" },
                  { id: "excel", label: "Excel Spreadsheet", icon: "📊" },
                  { id: "json", label: "Raw JSON", icon: "code" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setReportFormat(fmt.id)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      reportFormat === fmt.id
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-slate-800 bg-slate-800/50 text-slate-500 hover:border-slate-600"
                    }`}
                  >
                    <span
                      className={`text-2xl ${
                        fmt.id === "json"
                          ? "font-mono text-sm font-bold pt-1"
                          : ""
                      }`}
                    >
                      {fmt.icon}
                    </span>
                    <span className="text-sm font-medium">{fmt.label}</span>
                  </button>
                ))}
              </div>

              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                  includeBlockchainProof
                    ? "bg-cyan-900/20 border-cyan-500/30"
                    : "bg-slate-800/50 border-slate-700"
                }`}
                onClick={() =>
                  setIncludeBlockchainProof(!includeBlockchainProof)
                }
              >
                <div
                  className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                    includeBlockchainProof
                      ? "bg-cyan-500 border-cyan-500"
                      : "border-slate-500"
                  }`}
                >
                  {includeBlockchainProof && (
                    <span className="text-black text-sm font-bold">✓</span>
                  )}
                </div>
                <div>
                  <div
                    className={`font-medium ${
                      includeBlockchainProof
                        ? "text-cyan-400"
                        : "text-slate-400"
                    }`}
                  >
                    Include Blockchain Proofs
                  </div>
                  <p className="text-xs text-slate-500">
                    Embed TX Hash, Block Number, and IPFS CID links for every
                    receipt.
                  </p>
                </div>
              </div>
            </Card>

            <Button
              id="generate-btn"
              variant="primary"
              size="lg"
              className="w-full py-4 text-lg shadow-xl shadow-cyan-500/20"
              onClick={handleGenerate}
            >
              Generate Report
            </Button>
          </div>

          {/* --- RIGHT COLUMN: HISTORY --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Files */}
            <div className="sidebar-item">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 px-1">
                Recent Files
              </h3>
              <div className="space-y-3">
                {savedReports.map((report) => (
                  <div
                    key={report.id}
                    className="group bg-slate-900/80 border border-white/5 p-3 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                        {report.type === "PDF" ? "🔴" : "🟢"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {report.name}
                        </div>
                        <div className="text-xs text-slate-500 flex gap-2">
                          <span>{report.date}</span> •{" "}
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    {/* Hover Action */}
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-3 z-20">
                      <span className="text-lg hover:scale-110 transition-transform">
                        ⬇️
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <Card className="sidebar-item bg-gradient-to-b from-slate-800 to-slate-900 border-white/10">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">
                    Did you know?
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Selecting <span className="text-cyan-400">JSON format</span>{" "}
                    allows you to import this data directly into accounting
                    software like QuickBooks via API.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* --- PREVIEW PANEL (SLIDE DOWN) --- */}
        <div className="preview-panel overflow-hidden h-0 opacity-0">
          <Card className="bg-slate-900 border-t-4 border-t-cyan-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Live Preview</h2>
              <div className="text-sm text-slate-400">
                Showing first 3 of 45 items
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Vendor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 rounded-r-lg">Block Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {previewReceipts.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {row.vendor}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{row.date}</td>
                      <td className="px-4 py-3">
                        <Badge variant="default" size="sm">
                          {row.cat}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-cyan-600">
                        {row.hash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
